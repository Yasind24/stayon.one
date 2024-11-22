import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (_req) => {
  try {
    // Create a test post scheduled for 1 minute from now
    const scheduledDate = new Date(Date.now() + 60 * 1000);
    
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        content: 'Test scheduled post ' + new Date().toISOString(),
        scheduled_date: scheduledDate.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      post,
      scheduledFor: scheduledDate.toISOString() 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 