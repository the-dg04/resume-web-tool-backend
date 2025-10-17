import { createClient } from "@supabase/supabase-js";

export default async function supabaseFileUpload(filename, fileBody) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY
    );

    const res = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "")
      .upload(`${filename}`, fileBody);
    if (res.error) {
      return { error: res.error };
    } else {
      return {
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}/${filename}`,
      };
    }
  } catch (error) {
    return { error: error };
  }
}
