"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEffect, useState } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { useParams } from "next/navigation";
import { fetchScansByTypeAndPatientId } from "@/lib/scans/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function STLMesh({ geometry }: { geometry: THREE.BufferGeometry | null }) {
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
  const [loading, setLoading] = useState<boolean>(true);

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
            toast.error("No STL file found for this patient.");
            setLoading(false);
            return;
          }
        }

        const response = await fetch(scans[0].fileUrl);
        if (!response.ok) {
          toast.error("Failed to fetch STL file.");
          setLoading(false);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 100 * 1024 * 1024) {
          toast.error("STL file is too large to load.");
          setLoading(false);
          return;
        }
        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);
        setGeometry(geo as THREE.BufferGeometry);
      } catch (error) {
        console.error("Error loading STL file:", error);
        toast.error("Error loading STL file.");
      } finally {
        setLoading(false);
      }
    };
    fetchSTL();
  }, [patientId]);

  const onAutoCorrection = () => {
    toast.info("Auto correction is not implemented yet");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">3D Model Viewer</h1>
      <div className="flex justify-end">
        <Button className="cursor-pointer" onClick={onAutoCorrection}>
          Auto correction
        </Button>
      </div>
      <div className="w-full h-[calc(100vh-200px)] border border-gray-300 rounded mt-4">
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
            No STL model available.
          </div>
        )}
      </div>
    </div>
  );
}
