import { supabase } from './client';

export const AVATAR_BUCKET = 'avatars';

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteAvatar(path: string) {
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([path]);

  if (error) throw error;
}