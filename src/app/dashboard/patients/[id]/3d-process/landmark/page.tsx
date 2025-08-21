"use client";

import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEffect, useRef, useState, useCallback } from "react";
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
      <meshStandardMaterial color="#D3D2D0" />
    </mesh>
  );
}

interface LandmarkProps {
  position: [number, number, number];
  id: string;
  onRemove: (id: string) => void;
}

interface Landmark {
  id: string;
  position: [number, number, number];
  coordinates: THREE.Vector3;
}

interface SceneProps {
  geometry: THREE.BufferGeometry | null;
  onLandmarkAdd: (position: THREE.Vector3) => void;
  landmarks: Landmark[];
  onLandmarkRemove: (id: string) => void;
  meshRef: React.RefObject<THREE.Mesh | null>;
}

// Landmark component to render individual landmarks
function Landmark({ position, id, onRemove }: LandmarkProps) {
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onRemove(id);
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="red" transparent opacity={0.8} />
    </mesh>
  );
}

// Main 3D scene component with landmark functionality
function Scene({
  geometry,
  onLandmarkAdd,
  landmarks,
  onLandmarkRemove,
  meshRef,
}: SceneProps) {
  const { camera, raycaster } = useThree();
  // const meshRef = useRef();
  //avoid adding landmark when moving around the object
  const [isDragging, setIsDragging] = useState(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    mouseDownPos.current = { x: event.pointer.x, y: event.pointer.y };
    setIsDragging(false);
  };

  const handleClick = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      //If click is not on the mesh or user is rotating mesh don't add landmark
      if (!meshRef.current || isDragging) return;

      const distance = Math.sqrt(
        Math.pow(event.pointer.x - mouseDownPos.current.x, 2) +
          Math.pow(event.pointer.y - mouseDownPos.current.y, 2)
      );
      // Only place landmark if mouse didn't move much (threshold for click vs drag)
      if (distance > 0.01) return;

      // Get mouse position in normalized device coordinates
      const mouse = new THREE.Vector2();
      mouse.x = event.pointer.x;
      mouse.y = event.pointer.y;

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Check for intersections with the STL mesh
      const intersects = raycaster.intersectObject(meshRef.current, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const point = intersection.point;

        // Offset slightly along normal to prevent z-fighting
        if (intersection.face) {
          const normal = intersection.face.normal.clone();
          normal.transformDirection(intersection.object.matrixWorld);
          point.add(normal.multiplyScalar(0.001)); //if points needs to be on mesh then reduce this
        }

        onLandmarkAdd(point);
      }
    },
    [camera, raycaster, onLandmarkAdd, isDragging, meshRef]
  );

  return (
    <>
      <GizmoHelper alignment="bottom-right">
        <GizmoViewport
          axisColors={["red", "green", "blue"]}
          labelColor="black"
        />
      </GizmoHelper>
      <axesHelper args={[200]} />
      <gridHelper args={[1000, 100]} />
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

      <group
        ref={meshRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
      >
        {/* <StlMesh url="https://bsdgncamawsfsmpmxevw.supabase.co/storage/v1/object/public/all//fixed.stl" /> */}
        {/* <StlMesh url="https://bsdgncamawsfsmpmxevw.supabase.co/storage/v1/object/public/all//test%20mesh.stl" /> */}
        <STLMesh geometry={geometry} />
      </group>

      {/* Render all landmarks */}
      {landmarks.map((landmark) => (
        <Landmark
          key={landmark.id}
          position={landmark.position}
          id={landmark.id}
          onRemove={onLandmarkRemove}
        />
      ))}

      <OrbitControls />
    </>
  );
}

export default function LandmarkModelViewer() {
  const params = useParams();
  const patientId = params.id as string;

  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [mode, setMode] = useState("add"); // 'add' or 'remove'

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const fetchSTL = async () => {
      try {
        // First try to fetch auto-correction type files
        let scans = await fetchScansByTypeAndPatientId(
          "corrected-mesh",
          patientId
        );

        // If no auto-correction files found, fall back to raw_file type
        if (!scans.length) {
          scans = await fetchScansByTypeAndPatientId(
            "original-mesh",
            patientId
          );
          if (!scans.length) {
            toast.error("No STL file found for this patient.");
            return;
          }
        }

        const response = await fetch(scans[0].fileUrl);
        if (!response.ok) {
          toast.error("Failed to fetch STL file.");
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 100 * 1024 * 1024) {
          toast.error("STL file is too large to load.");
          return;
        }
        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);
        setGeometry(geo as THREE.BufferGeometry);
      } catch (error) {
        console.error("Error loading STL file:", error);
        toast.error("Error loading STL file.");
      }
    };
    fetchSTL();
  }, [patientId]);

  const handleLandmarkAdd = useCallback(
    (position: THREE.Vector3) => {
      if (mode !== "add") return;

      const newLandmark: Landmark = {
        id: String(position.x + position.y + position.z),
        position: [position.x, position.y, position.z],
        coordinates: position,
      };

      setLandmarks((prev) => [...prev, newLandmark]);
    },
    [mode]
  );

  const handleLandmarkRemove = useCallback((id: string) => {
    setLandmarks((prev) => prev.filter((landmark) => landmark.id !== id));
  }, []);

  const clearAllLandmarks = () => {
    setLandmarks([]);
  };

  const exportLandmarksGrassHopper = () => {
    // Format for Grasshopper Point component - array of [x,y,z] coordinates
    const points = landmarks.map((l) => [
      Number(l.position[0].toFixed(6)),
      Number(l.position[1].toFixed(6)),
      Number(l.position[2].toFixed(6)),
    ]);

    const data = {
      points: points,
      count: points.length,
      format: "grasshopper_points",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grasshopper_points.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onHandleRhinoCompute = async () => {
    try {
      const res = await fetch('/api/gh-clash', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      console.log(data)
    } catch (err) {
      console.error(err);
    } 
    // toast.info("Rhino Compute is not implemented yet");
  };

  const onHandleRhinoGh = async () => {
    try {
      const res = await fetch('/api/grasshopper', { method: 'POST'});
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      console.log(data)
    } catch (err) {
      console.error(err);
    } 
    // toast.info("Rhino Compute is not implemented yet");
  };

  return (
    <div className="h-screen relative">
      {/* Control Panel */}
      <div className="absolute top-6 left-6 z-10 bg-background p-6 rounded-lg shadow-lg border max-w-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Landmark Controls</h2>
            <p className="text-sm text-muted-foreground">
              Add and manage landmarks on the 3D model
            </p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode:</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setMode("add")}
                variant="ghost"
                className={`px-3 py-2 rounded-md text-sm font-medium`}
              >
                Add Landmarks
              </Button>
            </div>
          </div>

          {/* Landmark Count */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium">Landmarks:</span>
            <span className="text-sm font-bold text-primary">
              {landmarks.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={clearAllLandmarks}
              disabled={landmarks.length === 0}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Clear All
            </Button>
            <Button
              onClick={exportLandmarksGrassHopper}
              disabled={landmarks.length === 0}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Export for Grasshopper
            </Button>
            <Button
              onClick={onHandleRhinoCompute}
              disabled={landmarks.length === 0}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Compute
            </Button>
            <Button
              onClick={onHandleRhinoGh}
              disabled={landmarks.length === 0}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Run Grasshopper
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-md">
            <h4 className="text-sm font-semibold text-brand-900 mb-2">
              Instructions:
            </h4>
            <ul className="text-xs text-brand-800 space-y-1">
              <li>• Click on the 3D model to add landmarks</li>
              <li>• Click on red spheres to remove them</li>
              <li>• Use mouse to orbit, zoom, and pan</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Landmark List */}
      {landmarks.length > 0 && (
        <div className="absolute top-6 right-6 z-10 bg-background p-6 rounded-lg shadow-lg border max-w-xs max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Landmarks List</h3>
              <p className="text-sm text-muted-foreground">
                {landmarks.length} landmark{landmarks.length !== 1 ? "s" : ""}{" "}
                placed
              </p>
            </div>
            <div className="space-y-3">
              {landmarks.map((landmark, index) => (
                <div
                  key={landmark.id}
                  className="p-3 bg-muted/50 rounded-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Landmark {index + 1}
                    </span>
                    <Button
                      onClick={() => handleLandmarkRemove(landmark.id)}
                      variant="destructive"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>X: {landmark.position[0].toFixed(2)}</div>
                    <div>Y: {landmark.position[1].toFixed(2)}</div>
                    <div>Z: {landmark.position[2].toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* <Canvas camera={{ position: [0, 0, 50], fov: 75 }}> */}
      <Canvas camera={{ position: [50, 50, 100], fov: 60 }}>
        <Scene
          geometry={geometry}
          onLandmarkAdd={handleLandmarkAdd}
          landmarks={landmarks}
          onLandmarkRemove={handleLandmarkRemove}
          meshRef={meshRef}
        />
      </Canvas>
    </div>
  );
}
