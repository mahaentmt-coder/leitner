import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Lazily initialize Firebase Admin only if service account is configured
let firebaseApp = null;
async function getMessaging() {
  const hasJson = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const hasB64 = !!process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  const hasFields = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  if (!hasJson && !hasB64 && !hasFields) return null;

  if (!firebaseApp) {
    const admin = (await import('firebase-admin')).default;
    if (!admin.apps.length) {
      let serviceAccount;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } else if (hasFields) {
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
      } else {
        serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64.replace(/\s+/g, ''), 'base64').toString('utf8')
        );
      }
      firebaseApp = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      firebaseApp = admin.app();
    }
    return admin.messaging();
  }
  const admin = (await import('firebase-admin')).default;
  return admin.messaging();
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const today = new Date().toISOString().slice(0, 10);
  let sent = 0, failed = 0, errors = [];

  // ── Web push ──────────────────────────────────────────────────────────
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
        badge: '/icons/icon-192.png',
        url: '/'
      });

      try {
        await webpush.sendNotification(sub.subscription, payload);
        sent++;
      } catch (e) {
        console.error('Web push failed for', sub.profile_id, e.message);
        if (e.statusCode === 410) {
          await sb.from('push_subscriptions').delete().eq('profile_id', sub.profile_id);
        }
        failed++;
      }
    }
  }

  // ── FCM (Android) ─────────────────────────────────────────────────────
  const messaging = await getMessaging();
  if (messaging) {
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
          await messaging.send({
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
          console.error('FCM failed for', sub.profile_id, e.message);
          errors.push({ profile_id: sub.profile_id, code: e.code, message: e.message });
          if (e.code === 'messaging/registration-token-not-registered') {
            await sb.from('fcm_tokens').delete().eq('profile_id', sub.profile_id);
          }
          failed++;
        }
      }
    }
  }

  return res.status(200).json({ sent, failed, today, errors });
}
