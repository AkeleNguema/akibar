import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../config/prisma';
import webPush from 'web-push';

// Configuration VAPID
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicVapidKey && privateVapidKey) {
  webPush.setVapidDetails(
    'mailto:contact@akibar.com',
    publicVapidKey,
    privateVapidKey
  );
} else {
  console.warn("⚠️ VAPID keys missing in environment variables. Push notifications won't work.");
}

export const subscribePush = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;
  const subscription = req.body;

  if (!barId) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  try {
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        barId,
        endpoint: subscription.endpoint
      }
    });

    if (!existing) {
      await prisma.pushSubscription.create({
        data: {
          barId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Erreur inscription push:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
};

export const sendTestPush = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;
  if (!barId) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }
  
  try {
    await sendPushNotificationToBar(barId, {
      title: 'Test Akibar',
      body: 'Ceci est une notification de test'
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur d\'envoi' });
  }
}

export const sendPushNotificationToBar = async (barId: string, payload: { title: string, body: string, url?: string }) => {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { barId }
  });

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: '/logo.png',
    data: {
      url: payload.url || '/'
    }
  });

  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }, pushPayload);
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        console.error('Erreur envoi notification push', err);
      }
    }
  }
};
