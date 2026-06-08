import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let messaging = null;

async function initMessaging() {
  if (messaging) return messaging;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;

  try {
    const serviceAccount = JSON.parse(json);
    const admin = (await import('firebase-admin')).default;
    const { getMessaging } = await import('firebase-admin/messaging');

    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    messaging = getMessaging();
    return messaging;
  } catch (e) {
    console.error('Firebase init error:', e.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const today = new Date().toISOString().slice(0, 10);
  let sent = 0, failed = 0, errors = [];

  // ── Web push ──────────────────────────────────────────────────
  const { data: webSubs, error: webErr } = await sb
    .from('push_subscriptions')
    .select('*, profiles(username)');

  if (!webErr && webSubs?.length) {
    for (const sub of webSubs) {
      const { data: dueWords } = await sb
        .from('words').select('id').eq('profile_id', sub.profile_id)
        .eq('done', false).lte('next_review', today).limit(1);
      if (!dueWords?.length) continue;

      const { count } = await sb
        .from('words').select('id', { count: 'exact', head: true })
        .eq('profile_id', sub.profile_id).eq('done', false).lte('next_review', today);

      const username = sub.profiles?.username || 'there';
      const payload = JSON.stringify({
        title: 'Leitner — Time to review! 📚',
        body: `Hi ${username}! You have ${count} word${count !== 1 ? 's' : ''} due for review today.`,
        icon: '/icons/icon-192.png',
        url: '/'
      });

      try {
        await webpush.sendNotification(sub.subscription, payload);
        sent++;
      } catch (e) {
        console.error('Web push failed:', e.message);
        if (e.statusCode === 410) {
          await sb.from('push_subscriptions').delete().eq('profile_id', sub.profile_id);
        }
        errors.push({ type: 'web', message: e.message });
        failed++;
      }
    }
  }

  // ── FCM (Android) ─────────────────────────────────────────────
  const fcm = await initMessaging();
  if (fcm) {
    const { data: fcmSubs, error: fcmErr } = await sb
      .from('fcm_tokens')
      .select('*, profiles(username)');

    if (!fcmErr && fcmSubs?.length) {
      for (const sub of fcmSubs) {
        const { data: dueWords } = await sb
          .from('words').select('id').eq('profile_id', sub.profile_id)
          .eq('done', false).lte('next_review', today).limit(1);
        if (!dueWords?.length) continue;

        const { count } = await sb
          .from('words').select('id', { count: 'exact', head: true })
          .eq('profile_id', sub.profile_id).eq('done', false).lte('next_review', today);

        const username = sub.profiles?.username || 'there';
        try {
          await fcm.send({
            token: sub.fcm_token,
            notification: {
              title: 'Leitner — Time to review! 📚',
              body: `Hi ${username}! You have ${count} word${count !== 1 ? 's' : ''} due today.`
            },
            android: {
              priority: 'high',
              notification: { sound: 'default', channelId: 'leitner_reminders' }
            }
          });
          sent++;
        } catch (e) {
          console.error('FCM failed:', e.message);
          errors.push({ type: 'fcm', code: e.code, message: e.message });
          if (e.code === 'messaging/registration-token-not-registered') {
            await sb.from('fcm_tokens').delete().eq('profile_id', sub.profile_id);
          }
          failed++;
        }
      }
    }
  } else {
    errors.push({ type: 'fcm', message: 'Firebase not initialized — check FIREBASE_SERVICE_ACCOUNT_JSON' });
  }

  return res.status(200).json({ sent, failed, today, errors });
}
