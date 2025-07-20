"use client";

import { Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { BufferGeometry } from "three";

export function StlViewCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target as FileReader).result;
      if (!result) return;
      const loader = new STLLoader();
      const mesh = loader.parse(result as ArrayBuffer);
      setGeometry(mesh);
    };
    reader.readAsArrayBuffer(file);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            <span>3D Model Information</span>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className=""
          >
            Upload STL Model
          </Button>
        </CardTitle>
        <Input
          className="hidden"
          ref={fileInputRef}
          type="file"
          accept=".stl"
          onChange={onFileInputChange}
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[calc(100vh-360px)] border-t">
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
          {geometry && (
            <mesh geometry={geometry}>
              <meshStandardMaterial color="#D3D2D0" />
            </mesh>
          )}
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
      </CardContent>
    </Card>
  );
}
