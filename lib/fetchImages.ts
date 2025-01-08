import { supabase } from '@/lib/supabaseClient';

export async function fetchImagesFromBucket(bucketName: string) {
  // List objects in the specified bucket
  const { data, error } = await supabase.storage.from(bucketName).list();

  if (error) {
    console.error('Error fetching images:', error.message);
    return [];
  }

  // Generate public URLs for each object
  const images = data.map((file) => ({
    id: file.id || Math.random(), // Use a unique ID
    src: supabase.storage.from(bucketName).getPublicUrl(file.name).data.publicUrl,
    alt: file.name,
  }));

  return images;
}
