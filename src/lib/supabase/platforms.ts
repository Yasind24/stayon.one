import { supabase } from '../supabase';
import { PlatformConnection } from './types';

export async function createPlatformConnection(data: Omit<PlatformConnection, 'id' | 'created_at' | 'updated_at'>): Promise<PlatformConnection> {
  const { data: connection, error } = await supabase
    .from('platform_connections')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return connection;
}

export async function getPlatformConnections(): Promise<PlatformConnection[]> {
  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deletePlatformConnection(platformId: string): Promise<void> {
  const { error } = await supabase
    .from('platform_connections')
    .delete()
    .eq('platform_id', platformId);

  if (error) throw error;
}