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
        <CardTitle className="w-full justify-between flex items-center gap-2">
          <div className="flex items-center">
            <Box className="h-5 w-5" />
            <p>3D Model Information</p>
          </div>
          <div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Upload STL Model
            </Button>
            <Input
              className="hidden"
              ref={fileInputRef}
              type="file"
              accept=".stl"
              onChange={onFileInputChange}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full h-[calc(100vh-360px)]">
        <Canvas camera={{ position: [50, 50, 100], fov: 60 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          {geometry && (
            <mesh geometry={geometry}>
              <meshStandardMaterial color="#4f46e5" />
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
      </CardContent>
    </Card>
  );
}
