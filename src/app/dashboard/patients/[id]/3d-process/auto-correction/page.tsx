"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEffect, useState, useCallback } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { useParams } from "next/navigation";
import { fetchScansByTypeAndPatientId } from "@/lib/scans/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
} from "@/lib/supabase-storage";
import { createScan, updateScan } from "@/lib/scans/actions";
import {
  Upload,
  File,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle,
  HelpCircle,
  Monitor,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [".stl"];

interface STLMeshProps {
  geometry: THREE.BufferGeometry | null;
  color?: string;
}

function STLMesh({ geometry, color = "#D3D2D0" }: STLMeshProps) {
  if (!geometry) return null;
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function AutoCorrectionModelViewer() {
  const params = useParams();
  const patientId = params.id as string;

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [correctedGeometry, setCorrectedGeometry] =
    useState<THREE.BufferGeometry | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAutoCorrecting, setIsAutoCorrecting] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [existingAutoCorrection, setExistingAutoCorrection] =
    useState<boolean>(false);
  const [autoCorrectionCompleted, setAutoCorrectionCompleted] =
    useState<boolean>(false);
  const [correctedBlob, setCorrectedBlob] = useState<Blob | null>(null);
  const [isSavingToStorage, setIsSavingToStorage] = useState<boolean>(false);

  const validateAndLoadFile = useCallback((file: File): boolean => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".stl")) {
      toast.error("Please select a valid STL file");
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Please select a file smaller than 100MB.");
      return false;
    }

    return true;
  }, []);

  const parseSTLFile = useCallback(
    (file: File): Promise<THREE.BufferGeometry> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (!result) {
              reject(new Error("Failed to read file"));
              return;
            }

            const loader = new STLLoader();
            const geo = loader.parse(result as ArrayBuffer);
            resolve(geo);
          } catch {
            reject(
              new Error(
                "Failed to parse STL file. The file might be corrupted."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsArrayBuffer(file);
      });
    },
    []
  );

  useEffect(() => {
    const fetchSTL = async () => {
      setLoading(true);
      try {
        // First try to fetch auto-correction type files
        let scans = await fetchScansByTypeAndPatientId(
          "corrected-mesh",
          patientId
        );

        // Check if auto-correction files exist
        if (scans.length > 0) {
          setExistingAutoCorrection(true);
          // Load the corrected-mesh file for display
          const response = await fetch(scans[0].fileUrl);
          if (!response.ok) {
            toast.error("Failed to fetch corrected-mesh file.");
            setLoading(false);
            return;
          }

          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const loader = new STLLoader();
          const geo = loader.parse(arrayBuffer);
          setGeometry(geo as THREE.BufferGeometry);
          setLoading(false);
          return;
        }

        // If no auto-correction files found, fall back to raw_file type
        if (!scans.length) {
          scans = await fetchScansByTypeAndPatientId(
            "original-mesh",
            patientId
          );
          if (!scans.length) {
            setLoading(false);
            return; // Don't show error, just no files available
          }
        }

        const response = await fetch(scans[0].fileUrl);
        if (!response.ok) {
          toast.error("Failed to fetch STL file.");
          setLoading(false);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
          toast.error("STL file is too large to load.");
          setLoading(false);
          return;
        }

        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);
        setGeometry(geo as THREE.BufferGeometry);
      } catch {
        console.error("Error loading STL file");
        toast.error("Error loading STL file.");
      } finally {
        setLoading(false);
      }
    };
    fetchSTL();
  }, [patientId]);

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateAndLoadFile(file)) {
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    try {
      const geo = await parseSTLFile(file);
      setGeometry(geo);
      toast.success("STL file loaded successfully!");
    } catch (error) {
      console.error("Error parsing STL file:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to parse STL file"
      );
      setSelectedFile(null);
      setFileName("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an STL file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      const filePath = `${patientId}/corrected-mesh.stl`;

      // Check if auto-correction files already exist
      const existingScans = await fetchScansByTypeAndPatientId(
        "auto-correction",
        patientId
      );

      if (existingScans.length > 0) {
        // Delete old file from storage
        const oldFilePath = existingScans[0].fileUrl
          .split("/")
          .slice(-2)
          .join("/"); // Extract path from URL
        const deleteResult = await deleteFromSupabaseStorage(
          "patient-media",
          oldFilePath
        );

        if (deleteResult.error) {
          console.warn("Failed to delete old file:", deleteResult.error);
          // Continue with upload even if delete fails
        }
      }

      const response = await uploadToSupabaseStorage(
        "patient-media",
        selectedFile,
        filePath,
        selectedFile.type
      );

      if (response.error) {
        toast.error("Upload failed: " + response.error);
        return;
      }

      if (existingScans.length > 0) {
        // Update existing scan record
        await updateScan(patientId, "auto-correction", response.publicUrl);
        toast.success("Auto-correction STL file updated successfully!");
      } else {
        // Create new scan record
        await createScan({
          patientId,
          type: "auto-correction",
          fileUrl: response.publicUrl,
        });
        toast.success("Auto-correction STL file uploaded successfully!");
      }

      // Update state to reflect that auto-correction files now exist
      setExistingAutoCorrection(true);

      // Clear the form
      setSelectedFile(null);
      setFileName("");
      // Don't clear geometry - let user see the uploaded model
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save auto-correction STL file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileName("");
    setGeometry(null);
    setCorrectedGeometry(null);
    setCorrectedBlob(null);
    setAutoCorrectionCompleted(false);
  };

  const handleSaveToStorage = async () => {
    if (!correctedBlob) {
      toast.error("No corrected file available to save.");
      return;
    }

    setIsSavingToStorage(true);
    try {
      // Save the corrected file to storage
      const correctedFile = Object.assign(correctedBlob, {
        name: "corrected-mesh.stl",
      }) as File;

      const filePath = `${patientId}/corrected-mesh.stl`;
      const uploadResponse = await uploadToSupabaseStorage(
        "patient-media",
        correctedFile,
        filePath,
        correctedFile.type
      );

      if (uploadResponse.error) {
        throw new Error(uploadResponse.error);
      }

      // Create or update scan record for corrected file
      const existingCorrectedScans = await fetchScansByTypeAndPatientId(
        "corrected-mesh",
        patientId
      );
      if (existingCorrectedScans.length > 0) {
        await updateScan(patientId, "corrected-mesh", uploadResponse.publicUrl);
      } else {
        await createScan({
          patientId,
          type: "corrected-mesh",
          fileUrl: uploadResponse.publicUrl,
        });
      }

      setExistingAutoCorrection(true);
      toast.success("Corrected model saved to storage successfully!");
    } catch (error) {
      console.error("Save to storage error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save corrected model to storage"
      );
    } finally {
      setIsSavingToStorage(false);
    }
  };

  const handleAutoCorrection = async () => {
    if (!geometry) {
      toast.error("No STL model available for auto-correction.");
      return;
    }

    setIsAutoCorrecting(true);
    setAutoCorrectionCompleted(false);

    try {
      // Get the current STL file from storage or use the selected file
      let stlFile: File;

      if (selectedFile) {
        stlFile = selectedFile;
      } else {
        // Fetch the existing STL file from storage
        const scans = await fetchScansByTypeAndPatientId(
          "corrected-mesh",
          patientId
        );
        if (scans.length === 0) {
          const rawScans = await fetchScansByTypeAndPatientId(
            "original-mesh",
            patientId
          );
          if (rawScans.length === 0) {
            toast.error("No STL file found for auto-correction.");
            return;
          }
          const response = await fetch(rawScans[0].fileUrl);
          const blob = await response.blob();
          stlFile = Object.assign(blob, { name: "model.stl" }) as File;
        } else {
          const response = await fetch(scans[0].fileUrl);
          const blob = await response.blob();
          stlFile = Object.assign(blob, { name: "model.stl" }) as File;
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", stlFile);

      // Make POST request to auto-correction endpoint
      const endpoint = process.env.AUTO_CORRECTION_ENDPOINT + "/fix-mesh";
      if (!endpoint) {
        toast.error("Auto-correction endpoint not configured.");
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Auto-correction failed: ${response.statusText}`);
      }

      // Get the corrected STL file as blob
      const correctedBlob = await response.blob();

      // Parse the corrected STL file
      const arrayBuffer = await correctedBlob.arrayBuffer();
      const loader = new STLLoader();
      const correctedGeo = loader.parse(arrayBuffer);

      setCorrectedGeometry(correctedGeo as THREE.BufferGeometry);
      setCorrectedBlob(correctedBlob);
      setAutoCorrectionCompleted(true);

      toast.success(
        "Auto-correction completed successfully! Click 'Save to Storage' to save the corrected model."
      );
    } catch (error) {
      console.error("Auto-correction error:", error);
      toast.error(
        error instanceof Error ? error.message : "Auto-correction failed"
      );
    } finally {
      setIsAutoCorrecting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">3D Model Auto-Correction</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Upload and automatically correct 3D STL models for enhanced analysis. 
                  The system will detect and fix common mesh issues like holes, non-manifold edges, and inverted normals.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-muted-foreground">
          Upload, process, and auto-correct 3D STL models for enhanced analysis
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Upload STL Model
            <Badge variant="secondary">Step 1</Badge>
          </CardTitle>
          <CardDescription>
            Select an STL file to upload and process. Maximum file size: 100MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingAutoCorrection && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                An auto-correction file already exists. Uploading a new file will
                override the existing one.
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  onChange={handleFileInputChange}
                  accept={ALLOWED_FILE_TYPES.join(",")}
                  className="max-w-sm"
                  aria-label="Select STL file"
                />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    className="h-8 w-8 p-0"
                    aria-label="Clear selected file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isSubmitting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isSubmitting
                  ? "Uploading..."
                  : existingAutoCorrection
                  ? "Update STL"
                  : "Upload STL"}
              </Button>

              <Button
                variant="outline"
                onClick={handleAutoCorrection}
                disabled={!geometry || isAutoCorrecting}
                className="flex items-center gap-2"
              >
                {isAutoCorrecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {autoCorrectionCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    Run Auto-Correction
                  </>
                )}
              </Button>

              {autoCorrectionCompleted && correctedBlob && (
                <Button
                  variant="default"
                  onClick={handleSaveToStorage}
                  disabled={isSavingToStorage}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSavingToStorage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Save to Storage
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Viewer */}
      <Card>
        <CardHeader>
          <CardTitle>3D Model Viewer</CardTitle>
          <CardDescription>
            Interactive 3D visualization of your STL model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[calc(100vh-360px)] border border-border rounded-lg overflow-hidden relative bg-background">
            {loading ? (
              <div className="flex items-center justify-center h-full text-lg text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading STL model...
              </div>
            ) : geometry ? (
              <>
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
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    maxDistance={200}
                    minDistance={10}
                  />
                  <STLMesh geometry={geometry} color="#D3D2D0" />
                  {correctedGeometry && (
                    <STLMesh geometry={correctedGeometry} color="#10b981" />
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

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#D3D2D0]"></div>
                      <span>Original Model</span>
                    </div>
                    {correctedGeometry && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                        <span>Corrected Model</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-lg text-gray-500">
                <div className="text-center">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No STL model available</p>
                  <p className="text-sm text-gray-400">Please upload a file to view the 3D model</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
