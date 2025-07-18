"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEffect, useState, useCallback } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { useParams } from "next/navigation";
import { fetchScansByTypeAndPatientId } from "@/lib/scans/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { createScan } from "@/lib/scans/actions";
import { Upload, File, X } from "lucide-react";

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [".stl"];

interface STLMeshProps {
  geometry: THREE.BufferGeometry | null;
}

function STLMesh({ geometry }: STLMeshProps) {
  if (!geometry) return null;
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
}

export default function AutoCorrectionModelViewer() {
  const params = useParams();
  const patientId = params.id as string;

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const validateAndLoadFile = useCallback((file: File): boolean => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".stl")) {
      toast.error("Please select a valid STL file");
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Please select a file smaller than 100MB.");
      return false;
    }

    return true;
  }, []);

  const parseSTLFile = useCallback(
    (file: File): Promise<THREE.BufferGeometry> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (!result) {
              reject(new Error("Failed to read file"));
              return;
            }

            const loader = new STLLoader();
            const geo = loader.parse(result as ArrayBuffer);
            resolve(geo);
          } catch {
            reject(
              new Error(
                "Failed to parse STL file. The file might be corrupted."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsArrayBuffer(file);
      });
    },
    []
  );

  useEffect(() => {
    const fetchSTL = async () => {
      setLoading(true);
      try {
        // First try to fetch auto-correction type files
        let scans = await fetchScansByTypeAndPatientId(
          "auto-correction",
          patientId
        );

        // If no auto-correction files found, fall back to raw_file type
        if (!scans.length) {
          scans = await fetchScansByTypeAndPatientId("raw_file", patientId);
          if (!scans.length) {
            setLoading(false);
            return; // Don't show error, just no files available
          }
        }

        const response = await fetch(scans[0].fileUrl);
        if (!response.ok) {
          toast.error("Failed to fetch STL file.");
          setLoading(false);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
          toast.error("STL file is too large to load.");
          setLoading(false);
          return;
        }

        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);
        setGeometry(geo as THREE.BufferGeometry);
      } catch {
        console.error("Error loading STL file");
        toast.error("Error loading STL file.");
      } finally {
        setLoading(false);
      }
    };
    fetchSTL();
  }, [patientId]);

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateAndLoadFile(file)) {
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    try {
      const geo = await parseSTLFile(file);
      setGeometry(geo);
      toast.success("STL file loaded successfully!");
    } catch (error) {
      console.error("Error parsing STL file:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse STL file"
      );
      setSelectedFile(null);
      setFileName("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an STL file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      const filePath = `${patientId}/auto-correction/${selectedFile.name}`;

      const response = await uploadToSupabaseStorage(
        "patient-media",
        selectedFile,
        filePath,
        selectedFile.type
      );

      if (response.error) {
        toast.error("Upload failed: " + response.error);
        return;
      }

      await createScan({
        patientId,
        type: "auto-correction",
        fileUrl: response.publicUrl,
      });

      toast.success("Auto-correction STL file uploaded successfully!");

      // Clear the form
      setSelectedFile(null);
      setFileName("");
      // Don't clear geometry - let user see the uploaded model
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save auto-correction STL file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileName("");
    setGeometry(null);
  };

  const handleAutoCorrection = () => {
    toast.info("Auto correction feature is coming soon!");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">3D Model Auto-Correction</h1>

      {/* Upload Section */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Upload STL Model</h2>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="file"
              onChange={handleFileInputChange}
              accept={ALLOWED_FILE_TYPES.join(",")}
              className="border rounded px-2 py-1"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelectedFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isSubmitting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isSubmitting ? "Uploading..." : "Upload STL"}
          </Button>

          <Button
            variant="outline"
            onClick={handleAutoCorrection}
            disabled={!geometry}
          >
            Run Auto-Correction
          </Button>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="w-full h-[calc(100vh-320px)] border border-gray-300 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-lg text-gray-500">
            Loading STL model...
          </div>
        ) : geometry ? (
          <Canvas camera={{ position: [50, 50, 100], fov: 60 }}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            <STLMesh geometry={geometry} />
            <axesHelper args={[200]} />
            <gridHelper args={[1000, 100]} />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport
                axisColors={["#ff2060", "#20df80", "#2080ff"]}
                labelColor="black"
              />
            </GizmoHelper>
          </Canvas>
        ) : (
          <div className="flex items-center justify-center h-full text-lg text-gray-500">
            No STL model available. Please upload a file to view the 3D model.
          </div>
        )}
      </div>
    </div>
  );
}
