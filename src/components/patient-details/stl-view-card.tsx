"use client";

import { Box, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { BufferGeometry } from "three";
import * as THREE from "three";
import { toast } from "sonner";
import { fetchScansByTypeAndPatientId } from "@/lib/scans/data";
import { Scan } from "@/lib/definitions";
import Link from "next/link";

// TODO: Clean up this component
interface StlViewCardProps {
  patientId?: string;
}

// Component to automatically scale and position mesh
function AutoScaledMesh({
  geometry,
  color,
  meshId,
}: {
  geometry: BufferGeometry;
  color: string;
  meshId?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current && geometry) {
      try {
        // Compute bounding box
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;

        if (box) {
          const size = new THREE.Vector3();
          box.getSize(size);

          // Calculate scale to fit in viewport (assuming 100 unit viewport)
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scale = maxDimension > 0 ? 80 / maxDimension : 1;

          meshRef.current.scale.setScalar(scale);

          // Center the mesh
          const center = new THREE.Vector3();
          // box.getCenter(center);
          meshRef.current.position.sub(center.multiplyScalar(scale));
        }
      } catch (error) {
        console.error('Error in AutoScaledMesh useEffect:', error);
      }
    }
  }, [geometry, meshId]);

  if (!geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

interface ScanData {
  geometry: BufferGeometry | null;
  fixedMeshGeometry?: BufferGeometry | null;
  loading: boolean;
}

export function StlViewCard({ patientId }: StlViewCardProps) {
  const [scanData, setScanData] = useState<Record<string, ScanData>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const scanTypes = useMemo(
    () => ["original-mesh", "corrected-mesh", "final-mesh"],
    []
  );

  const loadScanGeometry = useCallback(async (type: string, scan: Scan) => {
    try {
      const response = await fetch(scan.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch scan file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);

      // Validate geometry
      if (!geometry || !geometry.attributes || !geometry.attributes.position) {
        throw new Error(`Invalid geometry loaded for ${type}`);
      }

      setScanData((prev) => ({
        ...prev,
        [type]: { geometry, loading: false },
      }));
    } catch (error) {
      console.error(`Failed to load ${type} scan geometry:`, error);
      toast.error(`Failed to load ${type} scan`);
      setScanData((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: false },
      }));
    }
  }, []);

  const loadFixedMeshGeometry = useCallback(async () => {
    try {
      console.log('Loading fixed mesh...');
      const response = await fetch('/fixed-mesh.stl');
      if (!response.ok) {
        throw new Error(`Failed to fetch fixed mesh: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);
      
      // Validate geometry
      if (!geometry || !geometry.attributes || !geometry.attributes.position) {
        throw new Error('Invalid geometry loaded from fixed mesh');
      }
      
      console.log('Fixed mesh loaded successfully:', geometry);

      setScanData((prev) => {
        console.log('Setting fixed mesh geometry in state');
        return {
          ...prev,
          'final-mesh': { 
            ...prev['final-mesh'], 
            fixedMeshGeometry: geometry,
            loading: false
          },
        };
      });
    } catch (error) {
      console.error('Failed to load fixed mesh geometry:', error);
      toast.error('Failed to load fixed mesh');
      setScanData((prev) => ({
        ...prev,
        'final-mesh': { 
          ...prev['final-mesh'], 
          loading: false 
        },
      }));
    }
  }, []);

  // Initialize scan data
  useEffect(() => {
    const initialData: Record<string, ScanData> = {};
    scanTypes.forEach((type) => {
      initialData[type] = {
        geometry: null,
        loading: false,
      };
    });
    setScanData(initialData);
  }, [scanTypes]);

  // Load latest scan for each type
  useEffect(() => {
    const loadLatestScans = async () => {
      if (!patientId) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);

      // Set all types to loading
      setScanData((prev) => {
        const newData = { ...prev };
        scanTypes.forEach((type) => {
          newData[type] = { ...newData[type], loading: true };
        });
        return newData;
      });

      try {
        // Fetch all scans in parallel
        const scanPromises = scanTypes.map(async (type) => {
          const scans = await fetchScansByTypeAndPatientId(type, patientId);
          return { type, scans };
        });

        const scanResults = await Promise.all(scanPromises);

        // Load geometries in parallel
        const geometryPromises = scanResults.map(async ({ type, scans }) => {
          if (type === 'final-mesh') {
            // For final-mesh, always load the fixed mesh, and database mesh if available
            const promises = [loadFixedMeshGeometry()];
            
            if (scans.length > 0) {
              promises.push(loadScanGeometry(type, scans[0]));
            }
            
            return Promise.all(promises);
          } else if (scans.length > 0) {
            return loadScanGeometry(type, scans[0]);
          } else {
            setScanData((prev) => ({
              ...prev,
              [type]: { ...prev[type], loading: false },
            }));
            return null;
          }
        });

        await Promise.all(geometryPromises);
      } catch (error) {
        console.error("Failed to load scans:", error);
        // Set all types to not loading on error
        setScanData((prev) => {
          const newData = { ...prev };
          scanTypes.forEach((type) => {
            newData[type] = { ...newData[type], loading: false };
          });
          return newData;
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadLatestScans();
  }, [patientId, scanTypes, loadScanGeometry]);

  const typeConfig = {
    "original-mesh": {
      label: "Original Scan",
      color: "#D3D2D0", // Gray
      route: "upload-mesh",
      buttonText: "Upload Scan",
    },
    "corrected-mesh": {
      label: "Corrected Scan",
      color: "#10b981", // Green
      route: "auto-correction",
      buttonText: "Auto Correct",
    },
    "final-mesh": {
      label: "Final Mesh",
      color: "#A3DBD6", // Blue
      route: "auto-modeling",
      buttonText: "Upload Scan",
    },
  } as const;

  const getTypeColor = (type: string) => {
    return typeConfig[type as keyof typeof typeConfig]?.color || "#D3D2D0";
  };

  const getTypeLabel = (type: string) => {
    return typeConfig[type as keyof typeof typeConfig]?.label || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          <span>3D Model Viewer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isInitialLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">Loading scans...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {scanTypes.map((type) => {
              const data = scanData[type];
              if (!data) return null;

              return (
                <div key={type} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{getTypeLabel(type)}</span>
                    {data.loading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  <div className="w-full h-[400px] border border-border rounded-lg overflow-hidden relative bg-background">
                    {data.geometry || (type === 'final-mesh' && data.fixedMeshGeometry) ? (
                      <>
                        <Canvas 
                          key={`${type}-${patientId}`}
                          camera={{ position: [80, 80, 120], fov: 60 }}
                          onError={(error) => {
                            console.error('Canvas error:', error);
                          }}
                        >
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

                          <OrbitControls
                            enablePan={true}
                            enableZoom={true}
                            enableRotate={true}
                            maxDistance={300}
                            minDistance={20}
                            target={[0, 0, 0]}
                          />

                          {type === 'final-mesh' ? (
                            <>
                              {console.log('Rendering final-mesh, fixedMeshGeometry:', data.fixedMeshGeometry, 'geometry:', data.geometry)}
                              {/* Render fixed mesh from public folder */}
                              {data.fixedMeshGeometry && data.fixedMeshGeometry.attributes && data.fixedMeshGeometry.attributes.position && (
                                <AutoScaledMesh
                                  geometry={data.fixedMeshGeometry}
                                  color="#D3D2D0"
                                  meshId="fixed-mesh"
                                />
                              )}
                              {/* Render mesh from database */}
                              {data.geometry && data.geometry.attributes && data.geometry.attributes.position && (
                                <AutoScaledMesh
                                  geometry={data.geometry}
                                  color={getTypeColor(type)}
                                  meshId="database-mesh"
                                />
                              )}
                            </>
                          ) : (
                            data.geometry && data.geometry.attributes && data.geometry.attributes.position && (
                              <AutoScaledMesh
                                geometry={data.geometry}
                                color={getTypeColor(type)}
                                meshId={type}
                              />
                            )
                          )}

                          <axesHelper args={[100]} />
                          <gridHelper args={[500, 50]} />
                        </Canvas>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {data.loading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading {getTypeLabel(type)}...</span>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                              <Box className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                No {getTypeLabel(type)} Available
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Upload a scan to view it here
                              </p>
                            </div>
                            {patientId && (
                              <Link
                                href={`/dashboard/patients/${patientId}/3d-process/${
                                  typeConfig[type as keyof typeof typeConfig]
                                    ?.route || "upload-mesh"
                                }`}
                              >
                                <Button size="sm" className="gap-2">
                                  <Upload className="h-4 w-4" />
                                  {typeConfig[type as keyof typeof typeConfig]
                                    ?.buttonText || "Upload Scan"}
                                </Button>
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Legend */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      {type === 'final-mesh' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: "#ff6b6b" }}
                            ></div>
                            <span>Fixed Mesh</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getTypeColor(type) }}
                            ></div>
                            <span>Database Mesh</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getTypeColor(type) }}
                          ></div>
                          <span>{getTypeLabel(type)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
