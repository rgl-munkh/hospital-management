"use client";

import { useEffect, useState, useCallback } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import RhinoViewer from "@/components/RhinoViewer";

export default function TestModelViewer() {

  const params = useParams();
  const patientId = params.id as string;
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  // useEffect(() => {
  //   const fetchHardcodedSTL = async () => {
  //     const response = await fetch('https://ngefjwnkcaxhjnmqbiyv.supabase.co/storage/v1/object/public/patient-media/0e765324-10e9-4a9a-9793-bcfac7605247/corrected-mesh.stl');
  //         if (!response.ok) {
  //           toast.error("Failed to fetch corrected-mesh file.");
  //           return;
  //         }

  //         console.log('Response received:', response);

  //         const blob = await response.blob();
  //         console.log('Blob received for hardCoded STL:', blob);
  //         const arrayBuffer = await blob.arrayBuffer();
  //         const loader = new STLLoader();
  //         const geo = loader.parse(arrayBuffer);
  //         console.log('Geometry parsed from hardCoded STL:', geo);
  //         setGeometry(geo as THREE.BufferGeometry);
  //         return;
  //   };
  //   fetchHardcodedSTL();
  // }, [patientId]);
  

  return (
    <div style={{ padding: 16 }}>
      <h1>Rhino 3DM Viewer</h1>
      <RhinoViewer url="http://localhost:4000/gh/3dm" payload={"responseJson"} />
    </div>
  );
}
