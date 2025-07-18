"use client";

import { Canvas, useThree } from "@react-three/fiber";
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
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
}

// Landmark component to render individual landmarks
function Landmark({ position, id, onRemove }) {
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onRemove(id);
      }}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color='red' transparent opacity={0.8} />
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
}) {
  const { camera, raycaster } = useThree();
  // const meshRef = useRef();
  //avoid adding landmark when moving around the object
  const [isDragging, setIsDragging] = useState(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event) => {
    mouseDownPos.current = { x: event.pointer.x, y: event.pointer.y };
    setIsDragging(false);
  };

  const handleClick = useCallback(
    (event) => {
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
    [camera, raycaster, onLandmarkAdd]
  );

  return (
    <>
      <GizmoHelper alignment='bottom-right'>
        <GizmoViewport
          axisColors={['red', 'green', 'blue']}
          labelColor='black'
        />
      </GizmoHelper>
      <axesHelper args={[200]} />
      <gridHelper args={[1000, 100]} />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

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

  const [landmarks, setLandmarks] = useState([]);
  const [mode, setMode] = useState('add'); // 'add' or 'remove'

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const meshRef = useRef<THREE.Mesh>(null);

  // Handle local file upload
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLandmarkAdd = useCallback(
    (position) => {
      if (mode !== 'add') return;

      const newLandmark = {
        id: position.x + position.y + position.z,
        position: [position.x, position.y, position.z],
        coordinates: position,
      };

      setLandmarks((prev) => [...prev, newLandmark]);
    },
    [mode]
  );

  const handleLandmarkRemove = useCallback((id) => {
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
      format: 'grasshopper_points',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grasshopper_points.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onAutoCorrection = () => {
    toast.info("Auto correction is not implemented yet");
  };

  const onHandleRhinoCompute = () => {
    toast.info("Rhino Compute is not implemented yet");
  };

  return (
    <div className='h-screen relative'>
      {/* Control Panel */}
      <div className='absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-sm'>
        <h2 className='text-lg font-semibold mb-3'>Landmark Controls</h2>

        {/* Mode Selection */}
        <div className='mb-3'>
          <label className='block text-sm font-medium mb-2'>Mode:</label>
          <div className='flex gap-2'>
            <button
              onClick={() => setMode('add')}
              className={`px-3 py-1 rounded text-sm ${
                mode === 'add'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Add Landmarks
            </button>
          </div>
        </div>

        {/* Landmark Count */}
        <div className='mb-3'>
          <span className='text-sm text-gray-600'>
            Landmarks: {landmarks.length}
          </span>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col gap-2'>
          <button
            onClick={clearAllLandmarks}
            disabled={landmarks.length === 0}
            className='px-3 py-2 bg-red-500 text-white rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Clear All
          </button>
          <button
            onClick={exportLandmarksGrassHopper}
            disabled={landmarks.length === 0}
            className="px-3 py-2 bg-green-500 text-white rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export for Grasshopper
          </button>

          <button
            onClick={onHandleRhinoCompute}
            disabled={landmarks.length === 0}
            className='px-3 py-2 bg-green-500 text-white rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Compute
          </button>
        </div>

        {/* Instructions */}
        <div className='mt-4 p-2 bg-blue-50 rounded text-xs text-blue-800'>
          <strong>Instructions:</strong>
          <br />
          • Click on the 3D model to add landmarks
          <br />
          • Click on red spheres to remove them
          <br />• Use mouse to orbit, zoom, and pan
        </div>
      </div>

      {/* Landmark List */}
      {landmarks.length > 0 && (
        <div className='absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-xs max-h-96 overflow-y-auto'>
          <h3 className='text-md font-semibold mb-2'>Landmarks List</h3>
          <div className='space-y-2'>
            {landmarks.map((landmark, index) => (
              <div key={landmark.id} className='text-xs bg-gray-50 p-2 rounded'>
                <div className='font-medium'>Landmark {index + 1}</div>
                <div className='text-gray-600'>
                  X: {landmark.position[0].toFixed(2)}
                  <br />
                  Y: {landmark.position[1].toFixed(2)}
                  <br />
                  Z: {landmark.position[2].toFixed(2)}
                </div>
                <button
                  onClick={() => handleLandmarkRemove(landmark.id)}
                  className='mt-1 px-2 py-1 bg-red-400 text-white rounded text-xs'
                >
                  Remove
                </button>
              </div>
            ))}
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
