import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MetaCommentContextsPanel, {
  type MetaCommentContext,
} from '@/pages/admin/communications/MetaCommentContextsPanel';

const context: MetaCommentContext = {
  id: 8,
  platform: 'facebook',
  title: 'منشور خدمة المواعيد',
  preview: 'هل يتوفر موعد هذا الأسبوع؟',
  postUrl: null,
  unreadCount: 1,
  isRead: false,
  isStarred: false,
  isFollowUpRequired: true,
  assignedToUserId: null,
  lastActivityAt: '2026-08-20T10:00:00.000Z',
  commentContext: {
    sourceType: 'facebook_post',
    title: 'منشور خدمة المواعيد',
  },
  items: [
    {
      id: 18,
      externalItemId: 'comment-18',
      authorName: 'مستخدم تجريبي',
      content: 'هل يتوفر موعد هذا الأسبوع؟',
      parentExternalId: null,
      externalPublishedAt: '2026-08-20T10:00:00.000Z',
      createdAt: '2026-08-20T10:00:00.000Z',
      isRead: false,
      direction: 'inbound',
      commentMetadata: { canComment: true, isHidden: false },
    },
  ],
};

describe('Unified inbox workspace', () => {
  it('keeps the comments workflow usable on compact screens with a return control', () => {
    const onSelectContext = vi.fn();
    render(
      <MetaCommentContextsPanel
        contexts={[context]}
        isLoading={false}
        platform="facebook"
        onSelectContext={onSelectContext}
        activeUsers={[]}
        onSubmitReply={vi.fn().mockResolvedValue(undefined)}
        onSubmitPrivateReply={vi.fn().mockResolvedValue(undefined)}
        onHiddenChange={vi.fn().mockResolvedValue(undefined)}
        onWorkflowChange={vi.fn().mockResolvedValue(undefined)}
        onEnrich={vi.fn().mockResolvedValue(undefined)}
        isActionPending={false}
        canReply
        canAssign
        canManage
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /منشور خدمة المواعيد/ }));
    expect(onSelectContext).toHaveBeenCalledWith(context);
    expect(screen.getByRole('button', { name: 'العودة إلى قائمة السياقات' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'متابعة' })).toBeTruthy();
  });
});
