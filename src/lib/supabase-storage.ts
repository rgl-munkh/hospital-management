import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  publicUrl: string;
  error?: string;
}

export async function uploadToSupabaseStorage(
  bucket: string,
  file: File,
  path: string,
  contentType: string,
  allowOverwrite: boolean = false
): Promise<UploadResult> {
  try {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType,
      cacheControl: "3600",
      upsert: allowOverwrite,
    });

    if (error) {
      console.error("Upload error:", error);
      return { publicUrl: "", error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return { publicUrl: urlData.publicUrl };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      publicUrl: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
