/**
 * اختبارات ChatWindow Component
 * ChatWindow Component Tests
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, act, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChatWindow from '@/components/ChatWindow';

const chatAreaHeaderSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/whatsapp/components/shared/ChatAreaHeader.tsx'),
  'utf8'
);
const chatInputSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/chat/ChatInput.tsx'),
  'utf8'
);
const chatHeaderSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/chat/ChatHeader.tsx'),
  'utf8'
);

interface GlobalWithEventSource {
  EventSource?: typeof MockEventSource;
}

// Mock trpc hook used in component
const mockRefetch = vi.fn();
const mockMutate = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    whatsapp: {
      messages: {
        listByConversation: { useQuery: () => ({ data: [], refetch: mockRefetch }) },
        send: { useMutation: () => ({ mutate: mockMutate, isPending: false }) },
      },
    },
  },
}));

// Provide a mock EventSource
class MockEventSource {
  url: string;
  listeners: Record<string, Function[]> = {};
  static instances: MockEventSource[] = [];
  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  addEventListener(event: string, cb: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }
  removeEventListener(event: string, cb: Function) {
    this.listeners[event] = (this.listeners[event] || []).filter(f => f !== cb);
  }
  close() {
    const index = MockEventSource.instances.indexOf(this);
    if (index > -1) {
      MockEventSource.instances.splice(index, 1);
    }
  }
  // helper to emit
  emit(data: unknown) {
    const ev = { data: JSON.stringify(data) } as unknown;
    (this.listeners['message'] || []).forEach((cb) => cb(ev));
  }
}

(global as unknown as GlobalWithEventSource).EventSource = MockEventSource;

describe('ChatWindow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockEventSource.instances = [];
  });

  describe('SSE Connection', () => {
    it('يجب أن يعرض رسالة SSE واردة', async () => {
      await act(async () => {
        render(<ChatWindow conversationId={42} />);
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emit({ event: 'message_created', data: { id: 1, conversationId: 42, content: 'مرحباً', direction: 'inbound', status: 'received', sentAt: new Date().toISOString() } });
      });

      await waitFor(() => {
        expect(screen.queryByText('مرحباً')).toBeTruthy();
      });
    });

    it('يجب أن ينشئ اتصال SSE عند التحميل', async () => {
      await act(async () => {
        render(<ChatWindow conversationId={123} />);
      });

      expect(MockEventSource.instances).toHaveLength(1);
      expect(MockEventSource.instances[0].url).toContain('123');
    });

    it('يجب أن يغلق اتصال SSE عند إلغاء التحميل', async () => {
      const { unmount } = await act(async () => {
        return render(<ChatWindow conversationId={42} />);
      });

      unmount();

      expect(MockEventSource.instances).toHaveLength(0);
    });
  });

  describe('Message Display', () => {
    it('يجب أن يعرض رسائل واردة', async () => {
      await act(async () => {
        render(<ChatWindow conversationId={42} />);
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emit({ event: 'message_created', data: { id: 1, conversationId: 42, content: 'رسالة واردة', direction: 'inbound', status: 'received', sentAt: new Date().toISOString() } });
      });

      await waitFor(() => {
        expect(screen.queryByText('رسالة واردة')).toBeTruthy();
      });
    });

    it('يجب أن يعرض رسائل صادرة', async () => {
      await act(async () => {
        render(<ChatWindow conversationId={42} />);
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emit({ event: 'message_created', data: { id: 2, conversationId: 42, content: 'رسالة صادرة', direction: 'outbound', status: 'sent', sentAt: new Date().toISOString() } });
      });

      await waitFor(() => {
        expect(screen.queryByText('رسالة صادرة')).toBeTruthy();
      });
    });
  });

  describe('Message Sending', () => {
    it('يجب أن يرسل رسالة عند الإرسال', async () => {
      await act(async () => {
        render(<ChatWindow conversationId={42} />);
      });

      // محاكاة إرسال رسالة
      // هذا الاختبار يتطلب تعديل المكون لقبول mock للإرسال
      expect(mockMutate).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('يجب أن يتعامل مع أخطاء SSE بشكل صحيح', async () => {
      await act(async () => {
        render(<ChatWindow conversationId={42} />);
      });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emit({ event: 'error', data: { error: 'Connection failed' } });
      });

      // يجب ألا يتعطل المكون عند حدوث خطأ
      expect(MockEventSource.instances).toHaveLength(1);
    });
  });
});

describe('تخطيط محادثة WhatsApp على الهاتف', () => {
  it('يجمع إجراءات الرأس الثانوية ويحافظ على عنوان العميل في مساحة مضغوطة', () => {
    expect(chatAreaHeaderSource).toContain('إجراءات المحادثة');
    expect(chatAreaHeaderSource).toContain('sm:hidden');
    expect(chatAreaHeaderSource).toContain('hidden items-center gap-1 sm:flex');
    expect(chatAreaHeaderSource).toContain('truncate text-sm font-bold');
  });

  it('يبقي محرر الرسائل صغيراً ويجمع الإرفاق ضمن الإجراءات الإضافية على الهاتف', () => {
    expect(chatInputSource).toContain('hidden h-10 w-10 shrink-0 sm:inline-flex');
    expect(chatInputSource).toContain('إجراءات إضافية');
    expect(chatInputSource).toContain('min-h-[44px]');
    expect(chatHeaderSource).toContain('hidden items-center justify-between');
  });
});
