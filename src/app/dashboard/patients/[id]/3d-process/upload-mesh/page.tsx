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
      <meshStandardMaterial color="#4f46e5" />
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
        const scans = await fetchScansByTypeAndPatientId("raw_file", patientId);
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

      const filePath = `${patientId}/${file.name}`;

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
        type: "raw_file",
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
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Upload STL file</h1>

      <div className="mb-4 flex gap-4">
        <Input
          type="file"
          onChange={onFileInputChange}
          accept=".stl"
          className="border rounded px-2 py-1 w-48"
        />
      </div>

      <div className="w-full h-[calc(100vh-240px)] border border-gray-300 rounded mt-4">
        <Canvas camera={{ position: [50, 50, 100], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
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

      <div className="flex justify-end mt-4">
        <Button
          type="button"
          onClick={submitPatient}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 "
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save STL & Patient"}
        </Button>
      </div>
    </div>
  );
};

export default UploadMeshPage;
