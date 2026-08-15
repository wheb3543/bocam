/**
 * Sidebar Notifications Hook
 * Custom hook لإدارة إشعارات الشريط الجانبي
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/api/trpc';
import useSSE from '@/hooks/integrations/useSSE';
import { SafeSSEParser } from '@/utils/errorHandling';

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface MessageEventWithType extends MessageEvent {
  type: string;
}

export function useSidebarNotifications(currentPath: string) {
  const [whatsappUnreadCount, setWhatsappUnreadCount] = useState(0);
  const currentPathRef = useRef(currentPath);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  // Fetch initial unread count
  const { data: initialUnreadData } = trpc.whatsapp.conversations.unreadCount.useQuery(undefined, {
    refetchInterval: 60000, // refresh every minute as fallback
  });

  useEffect(() => {
    if (initialUnreadData !== undefined) {
      setWhatsappUnreadCount(initialUnreadData as number);
    }
  }, [initialUnreadData]);

  // Play a gentle notification beep using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (
        window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext
      )();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {
      /* Audio not available */
    }
  }, []);

  // Global SSE listener for new inbound WhatsApp messages
  useSSE(
    '/api/whatsapp/stream/user/0',
    useCallback(
      (e: MessageEvent) => {
        SafeSSEParser.handleEvent(() => {
          const eventName = (e as MessageEventWithType).type || 'message';
          if (eventName === 'new_inbound_message') {
            // Only show badge if user is not currently on WhatsApp page
            const isOnWhatsApp = currentPathRef.current.includes('/admin/whatsapp');
            if (!isOnWhatsApp) {
              setWhatsappUnreadCount((prev) => prev + 1);
              playNotificationSound();
            }
          }
        });
      },
      [playNotificationSound]
    )
  );

  // Reset badge when user navigates to WhatsApp
  useEffect(() => {
    if (currentPath.includes('/admin/whatsapp')) {
      setWhatsappUnreadCount(0);
    }
  }, [currentPath]);

  return {
    whatsappUnreadCount,
  };
}
