import { supabase } from '../supabase';

interface CreateDraftData {
  content: string;
  mediaUrl?: string;
  link?: string;
}

export async function createDraft(data: CreateDraftData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: draft, error } = await supabase
    .from('post_drafts')
    .insert({
      user_id: user.id,
      content: data.content,
      media_url: data.mediaUrl,
      link: data.link
    })
    .select()
    .single();

  if (error) throw error;
  return draft;
}

export async function getDrafts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('post_drafts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateDraft(id: string, data: Partial<CreateDraftData>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: draft, error } = await supabase
    .from('post_drafts')
    .update({
      content: data.content,
      media_url: data.mediaUrl,
      link: data.link
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return draft;
}

export async function deleteDraft(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('post_drafts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}