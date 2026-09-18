import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  Inbox,
  MessageCircle,
  MessageSquare,
  Play,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Platform = 'messenger' | 'instagram' | 'facebook' | 'x' | 'linkedin' | 'youtube';
export type ChannelType = 'message' | 'comment';
export type InboxTabId =
  | 'all-messages'
  | Platform
  | 'facebook-comments'
  | 'instagram-comments'
  | 'x-comments'
  | 'linkedin-comments'
  | 'youtube-comments';

export type InboxTab = {
  id: InboxTabId;
  label: string;
  icon: LucideIcon;
  platform?: Platform;
  channelType?: ChannelType;
};

export const platformConfig: Record<
  Platform,
  { label: string; icon: LucideIcon; className: string }
> = {
  messenger: { label: 'Messenger', icon: MessageCircle, className: 'bg-sky-50 text-sky-700' },
  facebook: { label: 'Facebook', icon: MessageSquare, className: 'bg-blue-50 text-blue-700' },
  instagram: { label: 'Instagram', icon: Camera, className: 'bg-pink-50 text-pink-700' },
  x: { label: 'X', icon: AtSign, className: 'bg-slate-100 text-slate-700' },
  linkedin: { label: 'LinkedIn', icon: BriefcaseBusiness, className: 'bg-blue-50 text-blue-700' },
  youtube: { label: 'YouTube', icon: Play, className: 'bg-red-50 text-red-700' },
};

export const inboxTabs: InboxTab[] = [
  { id: 'all-messages', label: 'كل الرسائل', icon: Inbox, channelType: 'message' },
  {
    id: 'messenger',
    label: 'Messenger',
    icon: MessageCircle,
    platform: 'messenger',
    channelType: 'message',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Camera,
    platform: 'instagram',
    channelType: 'message',
  },
  { id: 'x', label: 'X', icon: AtSign, platform: 'x', channelType: 'message' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: BriefcaseBusiness,
    platform: 'linkedin',
    channelType: 'message',
  },
  {
    id: 'facebook-comments',
    label: 'تعليقات فيسبوك',
    icon: MessageSquare,
    platform: 'facebook',
    channelType: 'comment',
  },
  {
    id: 'instagram-comments',
    label: 'تعليقات Instagram',
    icon: Camera,
    platform: 'instagram',
    channelType: 'comment',
  },
  { id: 'x-comments', label: 'تعليقات X', icon: AtSign, platform: 'x', channelType: 'comment' },
  {
    id: 'linkedin-comments',
    label: 'تعليقات LinkedIn',
    icon: BriefcaseBusiness,
    platform: 'linkedin',
    channelType: 'comment',
  },
  {
    id: 'youtube-comments',
    label: 'تعليقات YouTube',
    icon: Play,
    platform: 'youtube',
    channelType: 'comment',
  },
];

export function buildSocialInboxFilters(tab: InboxTab, search: string) {
  return {
    platform: tab.platform,
    channelType: tab.channelType,
    search: search.trim() || undefined,
  };
}
