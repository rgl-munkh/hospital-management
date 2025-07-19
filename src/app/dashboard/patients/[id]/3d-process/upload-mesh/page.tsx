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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={onFileInputChange}
            accept=".stl"
            className="max-w-sm"
          />
        </div>
      </div>

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
          <pointLight 
            position={[0, 100, 0]} 
            intensity={0.5} 
            color="#ffffff"
          />
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

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={submitPatient}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save STL & Patient"}
        </Button>
      </div>
    </div>
  );
};

export default UploadMeshPage;
