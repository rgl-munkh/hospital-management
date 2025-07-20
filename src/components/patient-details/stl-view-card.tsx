"use client";

import { Box, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BufferGeometry } from "three";
import { toast } from "sonner";
import { fetchScansByTypeAndPatientId } from "@/lib/scans/data";
import { Scan } from "@/lib/definitions";
import Link from "next/link";

interface StlViewCardProps {
  patientId?: string;
}

interface ScanData {
  geometry: BufferGeometry | null;
  loading: boolean;
}

export function StlViewCard({ patientId }: StlViewCardProps) {
  const [scanData, setScanData] = useState<Record<string, ScanData>>({});

  const scanTypes = useMemo(() => ["original-mesh", "corrected-mesh"], []);

  const loadScanGeometry = useCallback(async (type: string, scan: Scan) => {
    try {
      const response = await fetch(scan.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch scan file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);

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
      if (!patientId) return;

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
          if (scans.length > 0) {
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
      }
    };

    loadLatestScans();
  }, [patientId, scanTypes, loadScanGeometry]);

  const typeConfig = {
    "original-mesh": {
      label: "Original Scan",
      color: "#D3D2D0", // Gray
      route: "upload-mesh",
      buttonText: "Upload Scan"
    },
    "corrected-mesh": {
      label: "Corrected Scan", 
      color: "#10b981", // Green
      route: "auto-correction",
      buttonText: "Auto Correct"
    }
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
        <div className="grid grid-cols-3 gap-6">
          {scanTypes.map((type) => {
            const data = scanData[type];
            if (!data) return null;

            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{getTypeLabel(type)}</span>
                  {data.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>

                <div className="w-full h-[400px] border border-border rounded-lg overflow-hidden relative bg-background">
                  {data.geometry ? (
                    <Canvas camera={{ position: [120, 120, 200], fov: 90 }}>
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
                        maxDistance={500}
                        minDistance={30}
                      />

                      <mesh geometry={data.geometry}>
                        <meshStandardMaterial color={getTypeColor(type)} />
                      </mesh>

                      <axesHelper args={[200]} />
                      <gridHelper args={[1000, 100]} />
                    </Canvas>
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
                            <Link href={`/dashboard/patients/${patientId}/3d-process/${typeConfig[type as keyof typeof typeConfig]?.route || "upload-mesh"}`}>
                              <Button size="sm" className="gap-2">
                                <Upload className="h-4 w-4" />
                                {typeConfig[type as keyof typeof typeConfig]?.buttonText || "Upload Scan"}
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legend */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getTypeColor(type) }}
                      ></div>
                      <span>{getTypeLabel(type)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
