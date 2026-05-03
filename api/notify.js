import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // Allow manual trigger via POST, or cron via GET
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Get current hour in Amsterdam time
  const nowAmsterdam = new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' });
  const currentHour = new Date(nowAmsterdam).getHours();

  // Get all subscriptions matching the current hour
  const { data: subs, error: subError } = await sb
    .from('push_subscriptions')
    .select('*, profiles(username)')
    .eq('reminder_hour', currentHour);

  if (subError) return res.status(500).json({ error: subError.message });
  if (!subs || subs.length === 0) return res.status(200).json({ sent: 0, message: 'No subscriptions for this hour' });

  const today = new Date().toISOString().slice(0, 10);
  let sent = 0, failed = 0;

  for (const sub of subs) {
    // Check if user has words due today
    const { data: dueWords } = await sb
      .from('words')
      .select('id')
      .eq('profile_id', sub.profile_id)
      .eq('done', false)
      .lte('next_review', today)
      .limit(1);

    if (!dueWords || dueWords.length === 0) continue;

    // Count total due
    const { count } = await sb
      .from('words')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', sub.profile_id)
      .eq('done', false)
      .lte('next_review', today);

    const username = sub.profiles?.username || 'there';
    const payload = JSON.stringify({
      title: 'Leitner — Time to review! 📚',
      body: `Hi ${username}! You have ${count} word${count !== 1 ? 's' : ''} due for review today.`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      url: '/'
    });

    try {
      await webpush.sendNotification(sub.subscription, payload);
      sent++;
    } catch (e) {
      console.error('Push failed for', sub.profile_id, e.message);
      // If subscription expired, remove it
      if (e.statusCode === 410) {
        await sb.from('push_subscriptions').delete().eq('profile_id', sub.profile_id);
      }
      failed++;
    }
  }

  return res.status(200).json({ sent, failed, hour: currentHour });
}
