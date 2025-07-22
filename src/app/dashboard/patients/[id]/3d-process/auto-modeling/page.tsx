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
import { Loader2, Upload, Settings, Play } from "lucide-react";

// File metadata type
interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  sizeFormatted: string;
  lastModifiedFormatted: string;
}

function STLMesh({ geometry, color = "#3b82f6" }: { geometry: THREE.BufferGeometry | null; color?: string }) {
  if (!geometry) return null;
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

const AutoModelingPage = () => {
  const params = useParams();
  const patientId = params.id as string;

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");

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
          "final-mesh",
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

  const simulateAutoModeling = async () => {
    if (!file) {
      toast.error("Please upload an STL file first.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Initializing auto-modeling process...");

    // Simulate processing steps
    const steps = [
      "Analyzing mesh topology...",
      "Detecting anatomical landmarks...",
      "Applying biomechanical corrections...",
      "Generating final orthotic model...",
      "Optimizing mesh for fabrication...",
      "Finalizing model parameters..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay per step
    }

    setProcessingStep("Auto-modeling completed successfully!");
    setIsProcessing(false);
    toast.success("Auto-modeling process completed!");
  };

  const submitFinalMesh = async () => {
    try {
      if (!file) {
        alert("Please upload an STL file.");
        return;
      }
      setIsSubmitting(true);

      const filePath = `${patientId}/final-mesh`;

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
        type: "final-mesh",
        fileUrl: response.publicUrl,
      });

      setIsSubmitting(false);

      toast.success("Final mesh uploaded successfully!");
      setFile(null);
      setGeometry(null);
      setFileMetadata(null);
    } catch (error) {
      toast.error("Failed to save final mesh: " + error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Auto Modeling - Final Mesh</h1>
        <p className="text-muted-foreground">
          Upload and process 3D STL models for final orthotic fabrication
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Input
          type="file"
          onChange={onFileInputChange}
          accept=".stl"
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={simulateAutoModeling}
            disabled={isProcessing || !file}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Auto Model
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={submitFinalMesh}
            disabled={isSubmitting || !file}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Save Final Mesh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Settings className="h-5 w-5 animate-spin" />
              Auto-Modeling in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-700">{processingStep}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Metadata Display */}
      {fileMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              File Information
              <Badge variant="secondary">Final Mesh</Badge>
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
          {geometry && <STLMesh geometry={geometry} color="#3b82f6" />}
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

export default AutoModelingPage;
