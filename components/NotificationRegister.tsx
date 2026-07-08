'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { messaging } from '@/lib/firebase-client';
import { getToken } from 'firebase/messaging';

export default function NotificationRegister() {
    const supabase = createClient();

    useEffect(() => {
        const setupNotifications = async () => {
            if (!messaging) return;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Izin notifikasi ditolak oleh user.');
                    return;
                }

                const fcmToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                if (fcmToken) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ fcm_token: fcmToken })
                        .eq('user_id', user.id);

                    if (error) console.error('Gagal menyimpan token ke Supabase:', error.message);
                    else console.log('Token FCM berhasil disinkronkan ke tabel profiles.');
                }
            } catch (error) {
                console.error('Terjadi kesalahan saat setup notifikasi:', error);
            }
        };

        setupNotifications();
    }, [supabase]);

    return null;
}