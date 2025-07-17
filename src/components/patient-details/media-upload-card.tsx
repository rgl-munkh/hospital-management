"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, FileImage, FileVideo } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";
import {
  saveMediaFile,
  fetchPatientMediaFiles,
} from "@/lib/media-files/actions";

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
  notes: string;
}

interface ExistingMediaFile {
  id: string;
  url: string;
  type: string | null;
  notes: string | null;
  createdAt: Date | null;
}

interface MediaUploadCardProps {
  patientId?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ["image/", "video/"];

// Component for displaying existing media files
function ExistingMediaFiles({ files }: { files: ExistingMediaFile[] }) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Existing Media Files ({files.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((media) => (
          <div key={media.id} className="border rounded-lg overflow-hidden">
            {/* Media Preview */}
            <div className="relative">
              {media.type === "image" ? (
                <Image
                  src={media.url}
                  alt={media.notes || "Media file"}
                  width={200}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  className="w-full h-48 object-cover"
                  muted
                />
              )}
            </div>

            {/* File Info */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {media.type === "image" ? (
                  <FileImage className="h-4 w-4" />
                ) : (
                  <FileVideo className="h-4 w-4" />
                )}
                <span className="font-medium">Media file</span>
              </div>

              {media.notes && (
                <p className="text-sm text-muted-foreground">{media.notes}</p>
              )}

              <p className="text-xs text-muted-foreground">
                {media.createdAt
                  ? new Date(media.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for individual media file preview
function MediaFilePreview({
  media,
  index,
  onRemove,
  onNotesChange,
}: {
  media: MediaFile;
  index: number;
  onRemove: (index: number) => void;
  onNotesChange: (index: number, notes: string) => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Media Preview */}
      <div className="relative">
        {media.type === "image" ? (
          <Image
            src={media.preview}
            alt={media.file.name}
            width={200}
            height={200}
            className="w-full h-48 object-cover"
          />
        ) : (
          <video
            src={media.preview}
            className="w-full h-48 object-cover"
            muted
          />
        )}

        {/* Remove button overlay */}
        <div className="absolute top-2 right-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* File Info and Description */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {media.type === "image" ? (
            <FileImage className="h-4 w-4" />
          ) : (
            <FileVideo className="h-4 w-4" />
          )}
          <span className="font-medium truncate">{media.file.name}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {(media.file.size / 1024 / 1024).toFixed(1)} MB
        </p>

        {/* Notes Input */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Notes (optional)
          </label>
          <Input
            type="text"
            placeholder="Add notes..."
            value={media.notes}
            onChange={(e) => onNotesChange(index, e.target.value)}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// Component for file selection header
function FileSelectionHeader({
  fileCount,
  onClearAll,
}: {
  fileCount: number;
  onClearAll: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-medium">Selected Files ({fileCount})</h3>
      <Button variant="outline" size="sm" onClick={onClearAll}>
        Clear All
      </Button>
    </div>
  );
}

// Component for upload button
function UploadButton({
  isUploading,
  onClick,
}: {
  isUploading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onClick}
        disabled={isUploading}
        className="min-w-[120px]"
      >
        {isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </>
        )}
      </Button>
    </div>
  );
}

// Main component
export function MediaUploadCard({ patientId }: MediaUploadCardProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [existingMediaFiles, setExistingMediaFiles] = useState<
    ExistingMediaFile[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing media files
  useEffect(() => {
    if (!patientId) return;

    const loadExistingMedia = async () => {
      setIsLoading(true);
      try {
        const files = await fetchPatientMediaFiles(patientId);
        setExistingMediaFiles(files);
      } catch (error) {
        console.error("Failed to load existing media files:", error);
        toast.error("Failed to load existing media files");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingMedia();
  }, [patientId]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => {
        URL.revokeObjectURL(media.preview);
      });
    };
  }, []); // Remove mediaFiles dependency as it's not needed for cleanup

  const createMediaFile = (file: File): MediaFile => {
    const preview = URL.createObjectURL(file);
    const type = file.type.startsWith("image/") ? "image" : "video";
    return { file, preview, type, notes: "" };
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.some((type) => file.type.startsWith(type))) {
      toast.error(`${file.name} is not a valid image or video file`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is too large. Maximum size is 100MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(validateFile);
    const newMediaFiles = validFiles.map(createMediaFile);

    setMediaFiles((prev) => [...prev, ...newMediaFiles]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = ""; // Reset input value
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFileNotes = (index: number, notes: string) => {
    setMediaFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], notes };
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (mediaFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    if (!patientId) {
      toast.error("Patient ID is required");
      return;
    }

    setIsUploading(true);
    const bucket = "patient-media";
    let successCount = 0;
    let errorCount = 0;

    try {
      // Upload files sequentially for reliability
      for (const media of mediaFiles) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${media.file.name}`;
        const path = `${patientId}/${fileName}`;

        try {
          // Upload to Supabase storage
          const uploadResult = await uploadToSupabaseStorage(
            bucket,
            media.file,
            path,
            media.file.type
          );

          if (uploadResult.error) {
            console.error(
              `Failed to upload ${media.file.name}:`,
              uploadResult.error
            );
            errorCount++;
            continue;
          }

          // Save to database
          await saveMediaFile(
            patientId,
            uploadResult.publicUrl,
            media.type,
            media.file.name,
            media.notes
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to process ${media.file.name}:`, error);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`${successCount} files uploaded successfully`);
        // Refresh existing media files after successful upload
        const updatedFiles = await fetchPatientMediaFiles(patientId);
        setExistingMediaFiles(updatedFiles);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} files failed to upload`);
      }

      // Clear the files after upload attempt
      setMediaFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const clearAllFiles = () => {
    mediaFiles.forEach((media) => {
      URL.revokeObjectURL(media.preview);
    });
    setMediaFiles([]);
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Media Upload
          </CardTitle>
          <CardDescription>
            Upload images and videos for this patient. Supports JPG, PNG, MP4,
            AVI, MOV files up to 100MB.
          </CardDescription>
        </div>
        <div>
          <Input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
            id="media-upload"
          />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer"
          >
            <label htmlFor="media-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Media Files */}
        {isLoading ? (
          <div className="space-y-4">
            <h3 className="font-medium">Loading existing media files...</h3>
          </div>
        ) : (
          <ExistingMediaFiles files={existingMediaFiles} />
        )}

        {/* File List */}
        {mediaFiles.length > 0 && (
          <div className="space-y-4">
            <FileSelectionHeader
              fileCount={mediaFiles.length}
              onClearAll={clearAllFiles}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaFiles.map((media, index) => (
                <MediaFilePreview
                  key={`${media.file.name}-${index}`}
                  media={media}
                  index={index}
                  onRemove={removeFile}
                  onNotesChange={updateFileNotes}
                />
              ))}
            </div>

            <UploadButton isUploading={isUploading} onClick={handleUpload} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
