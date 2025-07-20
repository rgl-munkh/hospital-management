"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEffect, useState } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import { createScan } from "@/lib/scans/actions";
import { toast } from "sonner";
import { fetchScansByTypeAndPatientId } from "@/lib/scans/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// File metadata type
interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  sizeFormatted: string;
  lastModifiedFormatted: string;
}

function STLMesh({ geometry }: { geometry: THREE.BufferGeometry | null }) {
  if (!geometry) return null;
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#D3D2D0" />
    </mesh>
  );
}

const UploadMeshPage = () => {
  const params = useParams();
  const patientId = params.id as string;

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const scans = await fetchScansByTypeAndPatientId(
          "original-mesh",
          patientId
        );
        if (scans.length === 0) {
          return;
        }

        // Fetch the actual file data from the URL
        const response = await fetch(scans[0].fileUrl);
        if (!response.ok) {
          console.error("Failed to fetch STL file:", response.statusText);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();

        // Check if the file is too large
        if (arrayBuffer.byteLength > 100 * 1024 * 1024) {
          // 100MB
          toast.error("Existing STL file is too large to load");

          return;
        }

        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);
        setGeometry(geo as THREE.BufferGeometry);
      } catch (error) {
        console.error("Error loading STL file:", error);
        toast.error("Failed to load existing STL file");
      }
    };
    fetchScans();
  }, [patientId]);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !file.name.toLowerCase().endsWith(".stl")) {
      alert("Please select a valid STL file");
      return;
    }

    // Check file size (limit to 100MB to prevent memory issues)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("File too large. Please select a file smaller than 100MB.");
      return;
    }

    setFile(file);

    // Extract and set file metadata
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeFormatted: formatFileSize(file.size),
      lastModifiedFormatted: formatDate(file.lastModified),
    };
    setFileMetadata(metadata);

    // parse the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = (e.target as FileReader).result;
        if (!result) return;
        const loader = new STLLoader();
        const geo = loader.parse(result as ArrayBuffer);
        setGeometry(geo);
      } catch (error) {
        console.error("Error parsing STL file:", error);
        toast.error(
          "Failed to parse STL file. The file might be corrupted or too large."
        );
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsArrayBuffer(file);
  };

  const submitPatient = async () => {
    try {
      if (!file) {
        alert("Please upload an STL file.");
        return;
      }
      setIsSubmitting(true);

      const filePath = `${patientId}/original-mesh`;

      const response = await uploadToSupabaseStorage(
        "patient-media",
        file,
        filePath,
        file.type
      );

      if (response.error) {
        alert("Upload failed: " + response.error);
        setIsSubmitting(false);
        return;
      }

      await createScan({
        patientId,
        type: "original-mesh",
        fileUrl: response.publicUrl,
      });

      setIsSubmitting(false);

      toast.success("STL file uploaded successfully!");
      setFile(null);
      setGeometry(null);
      setFileMetadata(null);
    } catch (error) {
      toast.error("Failed to save patient: " + error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upload STL File</h1>
        <p className="text-muted-foreground">
          Upload and visualize 3D STL models for patient analysis
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Input
          type="file"
          onChange={onFileInputChange}
          accept=".stl"
          className="max-w-sm"
        />
        <Button
          type="button"
          className=""
          onClick={submitPatient}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save STL & Patient"}
        </Button>
      </div>

      {/* File Metadata Display */}
      {fileMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              File Information
              <Badge variant="secondary">STL</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Name</p>
                <p className="text-sm">{fileMetadata.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Size</p>
                <p className="text-sm">{fileMetadata.sizeFormatted}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Type</p>
                <p className="text-sm">{fileMetadata.type || "application/sla"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Modified</p>
                <p className="text-sm">{fileMetadata.lastModifiedFormatted}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Raw Size (bytes)</p>
              <p className="text-sm font-mono">{fileMetadata.size.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="w-full h-[calc(100vh-280px)] border border-border rounded-lg overflow-hidden bg-background">
        <Canvas camera={{ position: [50, 50, 100], fov: 60 }}>
          {/* Studio lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[50, 50, 50]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight
            position={[-50, -50, -50]}
            intensity={0.3}
            color="#ffffff"
          />
          <pointLight position={[0, 100, 0]} intensity={0.5} color="#ffffff" />
          <OrbitControls />
          {geometry && <STLMesh geometry={geometry} />}
          <axesHelper args={[200]} />
          <gridHelper args={[1000, 100]} />
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={["#ff2060", "#20df80", "#2080ff"]}
              labelColor="black"
            />
          </GizmoHelper>
        </Canvas>
      </div>
    </div>
  );
};

export default UploadMeshPage;
