import React from 'react';
import { render, act } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { vi, describe, it, expect } from 'vitest';
import ChatWindow from '@/components/ChatWindow';

interface GlobalWithEventSource {
  EventSource?: typeof MockEventSource;
}

// Mock trpc hook used in component
vi.mock('@/lib/trpc', () => ({
  trpc: {
    whatsapp: {
      messages: {
        listByConversation: { useQuery: () => ({ data: [], refetch: () => {} }) },
        send: { useMutation: () => ({ mutate: () => {}, isPending: false }) },
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

describe('ChatWindow SSE', () => {
  it('displays incoming SSE message', async () => {
    await act(async () => {
      render(<ChatWindow conversationId={42} />);
    });

    // simulate server event
    const es = MockEventSource.instances[0];
    act(() => {
      es.emit({ event: 'message_created', data: { id: 1, conversationId: 42, content: 'hello', direction: 'inbound', status: 'received', sentAt: new Date().toISOString() } });
    });

    expect(await screen.findByText('hello')).toBeTruthy();
  });
});
