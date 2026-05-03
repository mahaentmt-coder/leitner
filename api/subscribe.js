export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'POST') {
    const { profile_id, subscription, reminder_hour } = req.body || {};
    if (!profile_id || !subscription) {
      return res.status(400).json({ error: 'Missing profile_id or subscription' });
    }
    const { error } = await sb.from('push_subscriptions').upsert(
      { profile_id, subscription, reminder_hour: reminder_hour ?? 8 },
      { onConflict: 'profile_id' }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { profile_id } = req.body || {};
    if (!profile_id) return res.status(400).json({ error: 'Missing profile_id' });
    await sb.from('push_subscriptions').delete().eq('profile_id', profile_id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
