import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/lib/api/trpc';
import {
  CheckCheck,
  Clock,
  XCircle,
  ChevronDown,
  Image,
  FileText,
  Music,
  Video,
  MapPin,
  Users,
  MessageSquare,
  User,
  MoreVertical,
  Reply,
  Trash2,
  Forward,
  Download,
  Paperclip,
  Calendar,
  Plus,
  Minus,
  Moon,
  Sun,
  MessageCircle,
  ShoppingCart,
  Search,
  Megaphone,
  Mic,
  MicOff,
  CheckSquare,
  Square,
  Eye,
  Copy,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useSSE from '@/hooks/integrations/useSSE';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import type { WhatsAppMessage as DBWhatsAppMessage, WhatsAppTemplate as DBWhatsAppTemplate, QuickReply as DBQuickReply } from '@shared/types';

// Re-export database types with local aliases for convenience
type WhatsAppMessage = DBWhatsAppMessage;
type WhatsAppTemplate = DBWhatsAppTemplate;
type DBQuickReplyType = DBQuickReply;

// Extended Message interface for UI use (includes temp IDs and optimistic updates)
interface Message {
  id?: string | number | null; // Allow string for temp IDs
  conversationId?: number | string | null;
  whatsappMessageId?: string | null;
  content?: string | null;
  messageType?: DBWhatsAppMessage['messageType'];
  direction?: DBWhatsAppMessage['direction'];
  sentAt?: string | Date | null;
  createdAt?: string | Date | null;
  sentBy?: number | null;
  metadata?: string | null;
  mediaId?: string | null;
  status?: DBWhatsAppMessage['status'];
  deliveredAt?: string | Date | null;
  readAt?: string | Date | null;
  replyToMessageId?: string | number | null;
  errorTitle?: string | null;
  errorCode?: string | null;
  reactions?: string[] | null;
  [key: string]: unknown;
}

// Template interface for UI use
type Template = WhatsAppTemplate;

// QuickReply interface for UI use
type QuickReply = DBQuickReplyType;

// Lazy image component for performance
const LazyImage = memo(
  ({
    src,
    alt,
    className,
    onClick,
  }: {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        className={className}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0.5, transition: 'opacity 0.3s' }}
      />
    );
  }
);

LazyImage.displayName = 'LazyImage';

interface ChatWindowProps {
  conversationId: number | null;
  lastMessageAt?: string | Date | null;
  onConversationUpdate?: () => void;
  phone?: string | null; // رقم هاتف العميل لإرسال القوالب
  contactName?: string | null;
}

/** Returns true if the last message was more than 24 hours ago (or never) */
function isOutsideWindow(lastMessageAt?: string | Date | null): boolean {
  if (!lastMessageAt) {return true;}
  const last = new Date(lastMessageAt).getTime();
  return Date.now() - last > 24 * 60 * 60 * 1000;
}

/** Format date for message separator like WhatsApp */
function formatDateForSeparator(date: Date): string {
  if (isToday(date)) {
    return 'اليوم';
  }
  if (isYesterday(date)) {
    return 'أمس';
  }
  if (isThisYear(date)) {
    return format(date, 'd MMMM', { locale: ar });
  }
  return format(date, 'd MMMM yyyy', { locale: ar });
}

/** Get date key for grouping messages */
function getDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

function getMessageTimestamp(msg: Message): number {
  return new Date(msg.sentAt ?? msg.createdAt ?? Date.now()).getTime();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMessage(value: unknown): value is Message {
  if (!isRecord(value)) {return false;}
  if ('direction' in value && value.direction !== null) {
    if (value.direction !== 'inbound' && value.direction !== 'outbound') {return false;}
  }
  if ('id' in value && value.id !== null) {
    if (typeof value.id !== 'string' && typeof value.id !== 'number') {return false;}
  }
  if ('content' in value && value.content !== null && typeof value.content !== 'string') {return false;}
  if ('sentAt' in value && value.sentAt !== null) {
    if (typeof value.sentAt !== 'string' && !(value.sentAt instanceof Date)) {return false;}
  }
  if ('createdAt' in value && value.createdAt !== null) {
    if (typeof value.createdAt !== 'string' && !(value.createdAt instanceof Date)) {return false;}
  }
  return true;
}

// Type guard for SSE payload validation
function isMessagePayload(value: unknown): value is Partial<Message> {
  return isRecord(value);
}

// Type guard for message update payload
function isMessageUpdatePayload(value: unknown): value is Partial<Message> & {
  messageId?: string | number;
  id?: string | number;
  whatsappMessageId?: string;
  status?: string;
  deliveredAt?: string | Date;
  readAt?: string | Date;
} {
  return isRecord(value);
}

// Type guard for message failed payload
function isMessageFailedPayload(value: unknown): value is Partial<Message> & {
  messageId?: string | number;
  id?: string | number;
  whatsappMessageId?: string;
  errorTitle?: string;
  errorCode?: string;
} {
  return isRecord(value);
}

// Type guard for conversation update payload
function isConversationUpdatePayload(value: unknown): value is {
  event?: string;
  conversationId?: number;
} {
  return isRecord(value);
}

/** Merge two message arrays: DB data takes priority, then local additions */
function mergeMessages(dbMsgs: Message[], localMsgs: Message[]): Message[] {
  const map = new Map<string | number, Message>();
  // DB messages first (authoritative)
  for (const m of dbMsgs) {
    if (m.id !== null && m.id !== undefined) {map.set(m.id, m);}
  }
  // Local messages: only add those not in DB (new SSE arrivals or optimistic)
  for (const m of localMsgs) {
    const key = m.id;
    if (key !== null && key !== undefined && !map.has(key)) {
      map.set(key, m);
    } else if (key !== null && key !== undefined && String(key).startsWith('temp-')) {
      // Keep optimistic messages that haven't been confirmed yet
      map.set(key, m);
    }
  }
  return Array.from(map.values()).sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));
}

export default function ChatWindow({
  conversationId,
  lastMessageAt,
  onConversationUpdate,
  phone,
  contactName,
}: ChatWindowProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isContactTyping, setIsContactTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last conversationId to reset state on change
  const prevConvIdRef = useRef<number | null>(null);
  // تتحدث بعد إرسال قالب بنجاح لفتح نافذة الكتابة
  const [localLastMessageAt, setLocalLastMessageAt] = useState<Date | null>(null);
  // Track the message being replied to
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // Track attached file
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track scheduled message dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledMessage, setScheduledMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Track forward message dialog
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);

  // Track voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isAudioPreviewOpen, setIsAudioPreviewOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Track link preview
  const [linkPreview, setLinkPreview] = useState<{
    url: string;
    title: string;
    description: string;
    image: string;
  } | null>(null);
  const [isFetchingLinkPreview, setIsFetchingLinkPreview] = useState(false);

  // Track reactions
  const [reactionDialogOpen, setReactionDialogOpen] = useState(false);
  const [messageToReact, setMessageToReact] = useState<Message | null>(null);
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Track message selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string | number>>(new Set());

  // Track search in conversation
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<string | number>>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Track media gallery
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null);

  // Track sticker library
  const [isStickerLibraryOpen, setIsStickerLibraryOpen] = useState(false);

  // Performance: Track visible messages for virtual scrolling
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Performance: Handle scroll events for virtual scrolling
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Calculate visible range based on scroll position
      const messageHeight = 100; // Approximate height per message
      const start = Math.max(0, Math.floor(scrollTop / messageHeight) - 10);
      const end = Math.min(localMessages.length, start + 60);

      setVisibleRange({ start, end });
    },
    [localMessages.length]
  );

  type SSEUpdate = { eventName: string; payload: unknown };

  // Performance: Debounced SSE updates
  const sseUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSSEUpdatesRef = useRef<SSEUpdate[]>([]);

  const getMessageTimestamp = (msg: Message) =>
    new Date(msg.sentAt ?? msg.createdAt ?? Date.now()).getTime();

  // Performance: Process SSE updates in batches
  const processSSEUpdates = useCallback(() => {
    if (pendingSSEUpdatesRef.current.length === 0) {return;}

    const updates = [...pendingSSEUpdatesRef.current];
    pendingSSEUpdatesRef.current = [];

    setLocalMessages((prev) => {
      let updated = [...prev];

      updates.forEach((update) => {
        const { eventName, payload } = update;

        // ── New inbound message (from webhook via pubsub) ──
        if (eventName === 'new_message') {
          const msg = isMessagePayload(payload) ? payload : undefined;
          if (!msg || String(msg.conversationId) !== String(conversationId)) {return;}

          // Avoid duplicate by id or whatsappMessageId
          const isDuplicate = updated.some(
            (m) =>
              (m.id !== null && m.id === msg.id) ||
              (m.whatsappMessageId &&
                msg.whatsappMessageId &&
                m.whatsappMessageId === msg.whatsappMessageId)
          );
          if (!isDuplicate) {
            const newMsg: Message = { ...msg, id: msg.id ?? `sse-${Date.now()}` };
            updated = [...updated, newMsg].sort(
              (a, b) =>
                new Date(a.sentAt || a.createdAt || Date.now()).getTime() -
                new Date(b.sentAt || b.createdAt || Date.now()).getTime()
            );
          }
        }

        // ── Message created (from db.ts helper for outbound) ──
        if (eventName === 'message_created') {
          const msg = isMessagePayload(payload) ? payload : undefined;
          if (!msg || String(msg.conversationId) !== String(conversationId)) {return;}

          // Replace optimistic temp message if content matches
          const tempIdx = updated.findIndex(
            (m) =>
              String(m.id).startsWith('temp-') &&
              m.content === msg.content &&
              m.direction === msg.direction
          );
          if (tempIdx >= 0) {
            updated[tempIdx] = { ...updated[tempIdx], ...msg };
          } else if (!updated.some((m) => m.id === msg.id)) {
            // Avoid duplicate
            updated = [...updated, msg].sort(
              (a, b) =>
                new Date(a.sentAt || a.createdAt || Date.now()).getTime() -
                new Date(b.sentAt || b.createdAt || Date.now()).getTime()
            );
          }
        }

        // ── Message status updated (delivered / read) ──
        if (eventName === 'message_updated') {
          const update = isMessageUpdatePayload(payload) ? payload : undefined;
          if (!update) {return;}
          const idx = updated.findIndex(
            (m) =>
              m.id === update.messageId ||
              m.id === update.id ||
              (m.whatsappMessageId &&
                update.whatsappMessageId &&
                m.whatsappMessageId === update.whatsappMessageId)
          );
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              status: update.status,
              deliveredAt: update.deliveredAt,
              readAt: update.readAt,
            };
          }
        }

        // ── Message failed ──
        if (eventName === 'message_failed') {
          const fail = isMessageFailedPayload(payload) ? payload : undefined;
          if (!fail) {return;}
          const idx = updated.findIndex(
            (m) =>
              m.id === fail.messageId ||
              m.id === fail.id ||
              (m.whatsappMessageId &&
                fail.whatsappMessageId &&
                m.whatsappMessageId === fail.whatsappMessageId)
          );
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              status: 'failed',
              errorTitle: fail.errorTitle,
              errorCode: fail.errorCode,
            };
          }
        }
      });

      return updated;
    });
  }, [conversationId]);

  // Custom stickers library
  const customStickers = [
    '😀',
    '😂',
    '😍',
    '🥰',
    '😎',
    '🤩',
    '😊',
    '🥳',
    '😇',
    '🤗',
    '👍',
    '👎',
    '👏',
    '🙌',
    '🤝',
    '💪',
    '❤️',
    '💔',
    '💯',
    '✨',
    '🎉',
    '🎊',
    '🎁',
    '🏆',
    '🥇',
    '🌟',
    '⭐',
    '💫',
    '🔥',
    '💥',
    '🌈',
    '☀️',
    '🌙',
    '⭐',
    '🌸',
    '🌺',
    '🌻',
    '🌹',
    '🍀',
    '🍁',
    '🐱',
    '🐶',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🦁',
    '🐯',
    '🐮',
    '🍕',
    '🍔',
    '🍟',
    '🌭',
    '🍿',
    '🧁',
    '🍩',
    '🍪',
    '🎂',
    '🍰',
    '🚗',
    '🚕',
    '🚙',
    '🚌',
    '🏎️',
    '🚂',
    '🚁',
    '✈️',
    '🚀',
    '🛸',
    '📱',
    '💻',
    '⌨️',
    '🖥️',
    '🖨️',
    '📷',
    '📸',
    '📹',
    '🎥',
    '📺',
  ];

  // Media gallery functions
  const getMediaMessages = useCallback(() => {
    return localMessages.filter(
      (msg: Message) => msg.messageType === 'image' || msg.messageType === 'video'
    );
  }, [localMessages]);

  const handleOpenMediaGallery = useCallback(() => {
    setIsMediaGalleryOpen(true);
  }, []);

  const handleCloseMediaGallery = useCallback(() => {
    setIsMediaGalleryOpen(false);
    setSelectedMedia(null);
  }, []);

  const handleDownloadMedia = useCallback((media: Message) => {
    if (media.mediaId) {
      const link = document.createElement('a');
      link.href = `/api/whatsapp/media/${media.mediaId}`;
      link.download = media.content || 'media';
      link.click();
    }
  }, []);

  // Track message font size
  const [messageFontSize, setMessageFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp-message-font-size');
      return saved ? parseInt(saved, 10) : 14;
    }
    return 14;
  });

  const handleFontSizeChange = useCallback((delta: number) => {
    setMessageFontSize((prev) => {
      const newSize = Math.max(12, Math.min(20, prev + delta));
      localStorage.setItem('whatsapp-message-font-size', newSize.toString());
      return newSize;
    });
  }, []);

  const handleRemoveFile = useCallback(() => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Search functions
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults([]);
        setCurrentSearchIndex(0);
        return;
      }

      const results: Array<string | number> = [];
      localMessages.forEach((msg: Message) => {
        if (msg.content && msg.content.toLowerCase().includes(query.toLowerCase()) && msg.id !== null && msg.id !== undefined) {
          results.push(msg.id);
        }
      });

      setSearchResults(results);
      setCurrentSearchIndex(0);
    },
    [localMessages]
  );

  const handleNextSearchResult = useCallback(() => {
    if (searchResults.length === 0) {return;}
    setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length);
    // Scroll to the next result
    setTimeout(() => {
      const nextResultId = searchResults[(currentSearchIndex + 1) % searchResults.length];
      const element = document.querySelector(`[data-message-id="${nextResultId}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [searchResults, currentSearchIndex]);

  const handlePreviousSearchResult = useCallback(() => {
    if (searchResults.length === 0) {return;}
    setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    // Scroll to the previous result
    setTimeout(() => {
      const prevResultId =
        searchResults[(currentSearchIndex - 1 + searchResults.length) % searchResults.length];
      const element = document.querySelector(`[data-message-id="${prevResultId}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [searchResults, currentSearchIndex]);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) {return text;}
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  // File helper functions
  const getFileIcon = useCallback((filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) {return <FileText className="h-8 w-8 text-red-500" />;}
    if (['doc', 'docx'].includes(ext)) {return <FileText className="h-8 w-8 text-blue-500" />;}
    if (['xls', 'xlsx'].includes(ext)) {return <FileText className="h-8 w-8 text-green-500" />;}
    if (['ppt', 'pptx'].includes(ext)) {return <FileText className="h-8 w-8 text-orange-500" />;}
    if (['zip', 'rar', '7z'].includes(ext)) {return <FileText className="h-8 w-8 text-purple-500" />;}
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
      {return <Image className="h-8 w-8 text-blue-400" />;}
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext))
      {return <Video className="h-8 w-8 text-purple-400" />;}
    if (['mp3', 'wav', 'ogg'].includes(ext)) {return <Music className="h-8 w-8 text-pink-400" />;}
    return <FileText className="h-8 w-8 text-gray-400" />;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Track night mode
  const [isNightMode, setIsNightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp-night-mode');
      return saved === 'true';
    }
    return false;
  });

  const handleToggleNightMode = useCallback(() => {
    setIsNightMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('whatsapp-night-mode', newValue.toString());
      return newValue;
    });
  }, []);

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        setIsAudioPreviewOpen(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('فشل بدء التسجيل. يرجى السماح بالوصول للميكروفون');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setRecordedAudio(null);
    setIsAudioPreviewOpen(false);
    setRecordingDuration(0);
  }, [stopRecording]);

  // Link preview functions
  const extractUrl = useCallback((text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }, []);

  const fetchLinkPreview = useCallback(async (url: string) => {
    setIsFetchingLinkPreview(true);
    try {
      // Use a CORS proxy to fetch the page
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        const title =
          doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
          doc.querySelector('title')?.textContent ||
          url;
        const description =
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
          '';
        const image =
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
          '';

        setLinkPreview({ url, title, description, image });
      }
    } catch (error) {
      console.error('Failed to fetch link preview:', error);
      setLinkPreview({ url, title: url, description: '', image: '' });
    } finally {
      setIsFetchingLinkPreview(false);
    }
  }, []);

  const handleMessageTextChange = useCallback(
    (text: string) => {
      setMessageText(text);

      const url = extractUrl(text);
      if (url && url !== linkPreview?.url) {
        fetchLinkPreview(url);
      } else if (!url) {
        setLinkPreview(null);
      }
    },
    [extractUrl, linkPreview?.url, fetchLinkPreview]
  );

  const handleReact = (msg: Message) => {
    setMessageToReact(msg);
    setReactionDialogOpen(true);
  };

  const handleSendReaction = (emoji: string) => {
    if (!messageToReact) {return;}

    // For now, just show a toast notification
    // In a real implementation, you would send this to the server
    toast.success(`تم إضافة رد عاطفي: ${emoji}`);

    setReactionDialogOpen(false);
    setMessageToReact(null);
  };

  // Message selection functions
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    setSelectedMessages(new Set());
  }, []);

  const toggleMessageSelection = useCallback((messageId: string | number) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const outsideWindow = isOutsideWindow(localLastMessageAt ?? lastMessageAt);

  const { data: messagesData, refetch: refetchMessages } =
    trpc.whatsapp.messages.listByConversation.useQuery(
      { conversationId: conversationId ?? 0 },
      { enabled: !!conversationId }
    );

  const { data: templates } = trpc.whatsapp.templates.list.useQuery(undefined, {
    enabled: !!conversationId,
  });

  const { data: activeUsers } = trpc.users.getActiveUsers.useQuery();

  const { data: quickReplies } = trpc.whatsapp.quickReplies.list.useQuery();

  const { data: allConversations } = trpc.whatsapp.conversations.list.useQuery(undefined, {
    enabled: forwardDialogOpen,
  });

  const handleExportConversation = useCallback(async () => {
    if (!conversationId) {return;}
    try {
      // For now, just export the current messages without using tRPC
      // This is a temporary solution until exportConversation is properly configured
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Add Arabic font support
      doc.setFont('helvetica');

      // Add title
      doc.setFontSize(16);
      doc.text('تصدير المحادثة', 105, 20, { align: 'center' });

      // Add conversation details
      doc.setFontSize(12);
      doc.text(`رقم الهاتف: ${contactName || 'غير محدد'}`, 20, 35);
      doc.text(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}`, 20, 45);

      // Add messages
      doc.setFontSize(10);
      let yPosition = 60;
      localMessages.forEach((msg: Message) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const direction = msg.direction === 'outbound' ? 'أنت' : 'العميل';
        const time = new Date(msg.sentAt || msg.createdAt || Date.now()).toLocaleTimeString('ar-EG');
        const content = msg.content || '';

        doc.setFont('helvetica', 'bold');
        doc.text(`${direction} - ${time}`, 20, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;
      });

      // Save PDF
      doc.save(`conversation-${contactName || 'export'}.pdf`);
      toast.success('تم تصدير المحادثة بنجاح');
    } catch (error) {
      console.error('Failed to export conversation:', error);
      toast.error('فشل تصدير المحادثة');
    }
  }, [conversationId, localMessages, contactName]);

  const sendMessageMutation = trpc.whatsapp.messages.send.useMutation({
    onSuccess: () => {
      setMessageText('');
      setReplyToMessage(null);
      // Don't refetch immediately - SSE will handle the new message
      // This prevents duplicate messages from appearing
      // refetchMessages();
      onConversationUpdate?.();
    },
    onError: (err) => {
      toast.error(`فشل إرسال الرسالة: ${err.message}`);
      // On error, remove the optimistic message
      setLocalMessages((prev) => prev.filter((m) => !String(m.id).startsWith('temp-')));
    },
  });

  const deleteMessageMutation = trpc.whatsapp.messages.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الرسالة');
      refetchMessages();
    },
    onError: (err) => {
      toast.error(`فشل حذف الرسالة: ${err.message}`);
    },
  });

  const handleDeleteSelectedMessages = useCallback(async () => {
    if (selectedMessages.size === 0) {return;}

    if (confirm(`هل أنت متأكد من حذف ${selectedMessages.size} رسالة؟`)) {
      const messageIds = Array.from(selectedMessages);
      for (const messageId of messageIds) {
        const id = typeof messageId === 'number' ? messageId : Number(messageId);
        if (Number.isNaN(id)) {continue;}
        await deleteMessageMutation.mutateAsync({ messageId: id });
      }
      toast.success(`تم حذف ${selectedMessages.size} رسالة`);
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
    }
  }, [selectedMessages, deleteMessageMutation]);

  const handleDeleteMedia = useCallback(
    (media: Message) => {
      if (media.id === null) {return;}
      if (confirm('هل أنت متأكد من حذف هذه الوسائط؟')) {
        deleteMessageMutation.mutate({ messageId: Number(media.id) });
      }
    },
    [deleteMessageMutation]
  );

  const forwardMessageMutation = trpc.whatsapp.messages.forward.useMutation({
    onSuccess: () => {
      toast.success('تم إعادة توجيه الرسالة');
      refetchMessages();
      onConversationUpdate?.();
    },
    onError: (err) => {
      toast.error(`فشل إعادة التوجيه: ${err.message}`);
    },
  });

  const sendTemplateMutation = trpc.whatsapp.sendTemplate.useMutation({
    onSuccess: () => {
      // فتح نافذة الكتابة فوراً بتحديث وقت آخر رسالة محلياً
      setLocalLastMessageAt(new Date());
      refetchMessages();
      onConversationUpdate?.();
      toast.success('تم إرسال القالب بنجاح — يمكنك الآن إرسال رسائل عادية');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`فشل إرسال القالب: ${message || 'خطأ غير معروف'}`);
    },
  });

  // ── Scroll helper ──────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }, []);

  // ── Send recorded audio ──────────────────────────────────────────────────────
  const sendRecordedAudio = useCallback(async () => {
    if (!recordedAudio || !conversationId) {return;}

    try {
      const audioFile = new File([recordedAudio], 'voice-message.webm', { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('/api/whatsapp/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        toast.error('فشل رفع الملف الصوتي');
        return;
      }

      const audioMediaId = data.mediaId || data.dataUrl;

      // For now, just send the audio directly without uploading to WhatsApp Media API
      // This is a temporary solution until uploadMedia is properly configured
      const optimistic = {
        id: `temp-${Date.now()}`,
        conversationId,
        direction: 'outbound' as const,
        content: 'رسالة صوتية',
        messageType: 'audio' as const,
        status: 'sent' as const,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        sentBy: userId,
        mediaId: audioMediaId,
      };
      setLocalMessages((prev) => [...prev, optimistic]);
      scrollToBottom();

      sendMessageMutation.mutate({
        conversationId,
        message: 'رسالة صوتية',
        mediaId: audioMediaId,
        messageType: 'audio',
      });

      toast.success('تم إرسال الرسالة الصوتية بنجاح');
      setRecordedAudio(null);
      setIsAudioPreviewOpen(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to send audio:', error);
      toast.error('فشل إرسال الرسالة الصوتية');
    }
  }, [recordedAudio, conversationId, userId, sendMessageMutation, scrollToBottom]);

  // ── Reset local state when conversation changes ────────────────────────────
  useEffect(() => {
    if (prevConvIdRef.current !== conversationId) {
      prevConvIdRef.current = conversationId;
      setLocalMessages([]);
    }
  }, [conversationId]);

  // ── Sync DB data into localMessages ───────────────────────────────────────
  useEffect(() => {
    if (messagesData && Array.isArray(messagesData)) {
      const validatedMessages = messagesData.filter(
        (msg: unknown): msg is Message => isMessage(msg)
      );
      setLocalMessages((prev) => mergeMessages(validatedMessages, prev));
    }
  }, [messagesData]);

  // ── SSE subscription for this conversation ────────────────────────────────
  useSSE(
    conversationId ? `/api/whatsapp/stream/${conversationId}` : null,
    useCallback(
      (e: MessageEvent) => {
        try {
          const eventName = (e as MessageEvent).type || 'message';
let payload: unknown;
          try {
            payload = JSON.parse(e.data);
          } catch {
            return;
          }

          // ── New inbound message (from webhook via pubsub) ──
          if (eventName === 'new_message') {
            // Add to pending queue for batch processing
            pendingSSEUpdatesRef.current.push({ eventName, payload });

            // Clear existing timeout and set new one
            if (sseUpdateTimeoutRef.current) {
              clearTimeout(sseUpdateTimeoutRef.current);
            }

            // Process updates after 100ms debounce
            sseUpdateTimeoutRef.current = setTimeout(() => {
              processSSEUpdates();
              onConversationUpdate?.();
              setTimeout(() => refetchMessages(), 1500);
            }, 100);

            return;
          }

          // ── Message created (from db.ts helper for outbound) ──
          if (eventName === 'message_created') {
            pendingSSEUpdatesRef.current.push({ eventName, payload });
            if (sseUpdateTimeoutRef.current) {clearTimeout(sseUpdateTimeoutRef.current);}
            sseUpdateTimeoutRef.current = setTimeout(() => processSSEUpdates(), 100);
            return;
          }

          // ── Message status updated (delivered / read) ──
          if (eventName === 'message_updated') {
            pendingSSEUpdatesRef.current.push({ eventName, payload });
            if (sseUpdateTimeoutRef.current) {clearTimeout(sseUpdateTimeoutRef.current);}
            sseUpdateTimeoutRef.current = setTimeout(() => processSSEUpdates(), 100);
            return;
          }

          // ── Message failed ──
          if (eventName === 'message_failed') {
            pendingSSEUpdatesRef.current.push({ eventName, payload });
            if (sseUpdateTimeoutRef.current) {clearTimeout(sseUpdateTimeoutRef.current);}
            sseUpdateTimeoutRef.current = setTimeout(() => processSSEUpdates(), 100);
            return;
          }

          // ── Typing indicator ──
          if (eventName === 'typing') {
            const typingPayload = isRecord(payload) ? payload : undefined;
            if (
              typingPayload?.conversationId &&
              String(typingPayload.conversationId) === String(conversationId)
            ) {
              setIsContactTyping(true);
              if (typingTimeoutRef.current) {clearTimeout(typingTimeoutRef.current);}
              typingTimeoutRef.current = setTimeout(() => setIsContactTyping(false), 4000);
            }
            return;
          }

          // ── Conversation updated ──
          const convUpdatePayload = isConversationUpdatePayload(payload) ? payload : undefined;
          if (eventName === 'conversation_updated' || convUpdatePayload?.event === 'conversation_updated') {
            onConversationUpdate?.();
          }
        } catch (_) {}
      },
      [conversationId, scrollToBottom, onConversationUpdate, refetchMessages]
    )
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {clearTimeout(typingTimeoutRef.current);}
      if (recordingIntervalRef.current) {clearInterval(recordingIntervalRef.current);}
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationId, scrollToBottom]);

  // Scroll when messages change
  useEffect(() => {
    if (localMessages.length > 0) {scrollToBottom();}
  }, [localMessages.length, scrollToBottom]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getMessageTypeIcon = (messageType?: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'contacts':
        return <Users className="h-4 w-4" />;
      case 'template':
        return <MessageSquare className="h-4 w-4" />;
      case 'interactive':
        return <MessageSquare className="h-4 w-4" />;
      case 'sticker':
        return <span className="text-2xl">🎨</span>;
      case 'reaction':
        return <span className="text-2xl">😀</span>;
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'product_enquiry':
        return <Search className="h-4 w-4" />;
      case 'referral':
        return <Megaphone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleSend = useCallback(async () => {
    if (!messageText.trim() && !attachedFile) {return;}
    if (!conversationId) {return;}

    let mediaId = null;
    let messageType: 'text' | 'image' | 'document' | 'video' | 'audio' = 'text';

    // Upload file to server if attached
    if (attachedFile) {
      try {
        const formData = new FormData();
        formData.append('file', attachedFile);

        const response = await fetch('/api/whatsapp/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          toast.error('فشل رفع الملف');
          return;
        }

        mediaId = data.mediaId || data.dataUrl; // Use mediaId if available, fallback to dataUrl

        // For now, just send the file directly without uploading to WhatsApp Media API
        // This is a temporary solution until uploadMedia is properly configured

        // Determine message type based on file
        if (attachedFile.type.startsWith('image/')) {
          messageType = 'image';
        } else if (attachedFile.type.startsWith('video/')) {
          messageType = 'video';
        } else if (attachedFile.type.startsWith('audio/')) {
          messageType = 'audio';
        } else {
          messageType = 'document';
        }
      } catch (error) {
        toast.error('فشل تحميل الملف');
        return;
      }
    }

    const optimistic = {
      id: `temp-${Date.now()}`,
      conversationId,
      direction: 'outbound' as const,
      content: messageText || attachedFile?.name || '',
      messageType,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sentBy: userId,
      replyToMessageId: replyToMessage?.id,
      mediaId,
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    scrollToBottom();
    const replyToMessageId = typeof replyToMessage?.id === 'number' ? replyToMessage.id : undefined;
    sendMessageMutation.mutate({
      conversationId,
      message: messageText.trim(),
      replyToMessageId,
      mediaId: mediaId || undefined,
      messageType,
    });
    setMessageText('');
    setReplyToMessage(null);
    handleRemoveFile();
    setLinkPreview(null);
  }, [
    conversationId,
    messageText,
    replyToMessage,
    sendMessageMutation,
    userId,
    attachedFile,
    handleRemoveFile,
    scrollToBottom,
  ]);

  const handleReply = (msg: Message) => {
    setReplyToMessage(msg);
    // Focus on textarea
    document.querySelector('textarea')?.focus();
  };

  const handleDelete = (msg: Message) => {
    if (msg.id === null) {return;}
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      deleteMessageMutation.mutate({ messageId: Number(msg.id) });
    }
  };

  const handleForward = (msg: Message) => {
    if (!msg.content) {
      toast.error('لا يمكن إعادة توجيه رسالة فارغة');
      return;
    }
    // Open forward dialog
    setMessageToForward(msg);
    setForwardDialogOpen(true);
  };

  const handleForwardToConversation = async (targetConversationId: number) => {
    if (!messageToForward) {return;}

    try {
      const forwardableTypes = ['image', 'video', 'audio', 'document', 'template'] as const;
      const messageType = forwardableTypes.includes(messageToForward.messageType as 'image' | 'video' | 'audio' | 'document' | 'template')
        ? (messageToForward.messageType as 'image' | 'video' | 'audio' | 'document' | 'template')
        : 'text';

      await sendMessageMutation.mutateAsync({
        conversationId: targetConversationId,
        message: messageToForward.content || '',
        messageType,
      });

      toast.success('تم إعادة توجيه الرسالة بنجاح');
      setForwardDialogOpen(false);
      setMessageToForward(null);
    } catch (error) {
      console.error('Failed to forward message:', error);
      toast.error('فشل إعادة توجيه الرسالة');
    }
  };

  const handleInsertQuickReply = (content: string) => {
    setMessageText((prev) => prev + (prev ? ' ' : '') + content);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('حجم الملف كبير جداً. الحد الأقصى 10MB');
        return;
      }
      setAttachedFile(file);
    }
  };

  const handleScheduleMessage = () => {
    if (!scheduledMessage.trim() || !scheduledDate) {
      toast.error('يرجى إدخال الرسالة وتاريخ الجدولة');
      return;
    }
    if (!conversationId) {return;}

    // Save scheduled message to local storage for now
    const scheduledMsg = {
      conversationId,
      message: scheduledMessage,
      scheduledDate,
      createdAt: new Date().toISOString(),
    };

    const scheduledMessages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
    scheduledMessages.push(scheduledMsg);
    localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));

    toast.success(`تم جدولة الرسالة لـ ${new Date(scheduledDate).toLocaleString('ar-EG')}`);
    setScheduleDialogOpen(false);
    setScheduledMessage('');
    setScheduledDate('');
  };

  const handleSendTemplate = (template: {
    id: number;
    name: string;
    content: string;
    metaName?: string | null;
    languageCode?: string | null;
    buttons?: string | null;
    headerText?: string | null;
    footerText?: string | null;
  }) => {
    if (!conversationId) {return;}
    if (!phone) {
      toast.error('لا يوجد رقم هاتف لهذه المحادثة');
      return;
    }
    // استخدام metaName (الاسم المعتمد من Meta) إذا كان متاحاً، وإلا name
    const templateName = template.metaName || template.name;
    const languageCode = template.languageCode || 'ar';
    sendTemplateMutation.mutate({
      phone,
      templateName,
      language: languageCode,
      conversationId,
      templateContent: template.content,
      templateButtons: template.buttons || undefined,
      headerText: template.headerText || undefined,
      footerText: template.footerText || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Search bar */}
      {isSearchOpen && (
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-2 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في الرسائل..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-8 text-sm"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>
                {currentSearchIndex + 1}/{searchResults.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handlePreviousSearchResult}
              >
                <ChevronDown className="h-3 w-3 rotate-90" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleNextSearchResult}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsSearchOpen(false)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto p-4 ${isNightMode ? 'bg-gray-900' : 'bg-[#e5ddd5] dark:bg-gray-900/50'}`}
      >
        {!localMessages || localMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <span className="text-green-500 font-bold">واتساب</span>
            </div>
            <p className="text-sm">لا توجد رسائل في هذه المحادثة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top spacer for virtual scrolling */}
            <div style={{ height: visibleRange.start * 100 }} />
            {localMessages
              .slice(visibleRange.start, visibleRange.end)
              .map((msg: Message, idx: number) => {
                // inbound = رسالة من العميل → تظهر على اليمين (في RTL)
                // outbound = رسالة من الموظف → تظهر على اليسار (في RTL)
                const isOutbound = msg.direction === 'outbound';
                const typeIcon = getMessageTypeIcon(msg.messageType);
                // Get sender name for outbound messages
                const senderName =
                  isOutbound && msg.sentBy
                    ? activeUsers?.find((u) => u.id === msg.sentBy)?.name || 'موظف'
                    : null;

                // Get message date for separator
                const msgDate = new Date(msg.sentAt ?? msg.createdAt ?? Date.now());
                const prevMsg = idx > 0 ? localMessages[idx - 1] : null;
                const prevDate = prevMsg
                  ? new Date(prevMsg.sentAt ?? prevMsg.createdAt ?? Date.now())
                  : null;
                const showDateSeparator = !prevDate || getDateKey(msgDate) !== getDateKey(prevDate);

                // Check if this message is a search result
                const isSearchResult = msg.id !== null && msg.id !== undefined && searchResults.includes(msg.id);
                const isCurrentSearchResult = msg.id !== null && searchResults[currentSearchIndex] === msg.id;

                return (
                  <React.Fragment key={msg.id || `${idx}`}>
                    {/* Date separator */}
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                          {formatDateForSeparator(msgDate)}
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex ${isOutbound ? 'justify-start' : 'justify-end'} group ${isCurrentSearchResult ? 'ring-2 ring-yellow-400 dark:ring-yellow-600 rounded-lg' : ''}`}
                      data-message-id={msg.id}
                    >
                      {/* Selection checkbox */}
                      {isSelectionMode && (
                        <div className="flex items-center justify-center px-2">
                          <button
                            onClick={() => msg.id !== null && msg.id !== undefined && toggleMessageSelection(msg.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            {selectedMessages.has(msg.id ?? '') ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      )}
                      <div
                        className={`${
                          isOutbound
                            ? 'bg-white dark:bg-gray-800 text-foreground rounded-bl-none'
                            : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-none'
                        } max-w-[90%] sm:max-w-[75%] md:max-w-[70%] rounded-lg p-2 sm:p-2.5 md:p-3 shadow-sm relative`}
                      >
                        {/* Sender name for outbound messages */}
                        {senderName && (
                          <div
                            className={`text-[9px] sm:text-[10px] font-medium mb-1 ${isOutbound ? 'text-blue-600' : 'text-white/80'}`}
                          >
                            <User className="h-2 w-2 sm:h-2.5 sm:w-2.5 inline ml-1" />
                            {senderName}
                          </div>
                        )}
                        {!isOutbound && contactName && (
                          <div className="text-[9px] sm:text-[10px] font-medium mb-1 text-white/80">
                            <User className="h-2 w-2 sm:h-2.5 sm:w-2.5 inline ml-1" />
                            {contactName}
                          </div>
                        )}

                        {/* Quoted message */}
                        {msg.replyToMessageId && (
                          <div
                            className={`text-[9px] sm:text-[10px] mb-1 p-1 sm:p-1.5 rounded ${isOutbound ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/20'}`}
                          >
                            <Reply className="h-2 w-2 sm:h-2.5 sm:w-2.5 inline ml-1" />
                            <span className="opacity-70">رد على رسالة سابقة</span>
                          </div>
                        )}

                        {typeIcon &&
                          msg.messageType !== 'template' &&
                          msg.messageType !== 'button_reply' &&
                          msg.messageType !== 'list_reply' && (
                            <div
                              className={`flex items-center gap-1 sm:gap-1.5 mb-1 ${isOutbound ? 'text-muted-foreground' : 'text-white/80'}`}
                            >
                              {typeIcon}
                              <span className="text-[10px] uppercase font-medium">
                                {msg.messageType}
                              </span>
                            </div>
                          )}

                        {/* عرض رسائل القالب مع الأزرار */}
                        {msg.messageType === 'template' ? (
                          (() => {
                            type TemplateButton = {
                              type?: string;
                              text: string;
                              title?: string;
                            };

                            let meta: Record<string, unknown> | null = null;
                            try {
                              meta = msg.metadata ? JSON.parse(msg.metadata) : null;
                            } catch {
                              meta = null;
                            }

                            const buttons: TemplateButton[] = Array.isArray(meta?.buttons)
                              ? (meta.buttons as unknown[])
                                  .filter(
                                    (button): button is TemplateButton =>
                                      typeof button === 'object' &&
                                      button !== null &&
                                      'text' in button &&
                                      typeof button.text === 'string'
                                  )
                                  .map((button) => ({
                                    type: button.type,
                                    text: button.text,
                                    title: (button as TemplateButton).title,
                                  }))
                              : [];

                            const headerText = typeof meta?.headerText === 'string' ? meta.headerText : undefined;
                            const footerText = typeof meta?.footerText === 'string' ? meta.footerText : undefined;
                            return (
                              <div>
                                {/* Header */}
                                {headerText && (
                                  <div
                                    className={`text-[11px] font-bold mb-1 pb-1 border-b ${isOutbound ? 'border-gray-200 dark:border-gray-600' : 'border-white/30'}`}
                                  >
                                    {headerText}
                                  </div>
                                )}
                                {/* TEMPLATE badge */}
                                <div
                                  className={`flex items-center gap-1 mb-1 ${isOutbound ? 'text-muted-foreground' : 'text-white/70'}`}
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  <span className="text-[10px] font-medium">TEMPLATE</span>
                                </div>
                                {/* Body */}
                                <div
                                  className="whitespace-pre-wrap break-words leading-relaxed"
                                  style={{ fontSize: `${messageFontSize}px` }}
                                >
                                  {msg.content}
                                </div>
                                {/* Footer */}
                                {footerText && (
                                  <div
                                    className={`text-[10px] mt-1 ${isOutbound ? 'text-muted-foreground' : 'text-white/60'}`}
                                  >
                                    {footerText}
                                  </div>
                                )}
                                {/* Buttons */}
                                {buttons.length > 0 && (
                                  <div className="mt-2 flex flex-col gap-1">
                                    {buttons.map((btn: TemplateButton, i: number) => (
                                      <div
                                        key={i}
                                        className={`text-center text-[12px] font-medium py-1.5 px-3 rounded border cursor-default select-none ${
                                          isOutbound
                                            ? 'border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                                            : 'border-white/40 text-white bg-white/10'
                                        }`}
                                      >
                                        {btn.text || btn.title || ''}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : msg.messageType === 'button_reply' ||
                          msg.messageType === 'list_reply' ? (
                          /* عرض رد زر العميل */
                          <div>
                            <div
                              className={`flex items-center gap-1 mb-1 ${isOutbound ? 'text-muted-foreground' : 'text-white/70'}`}
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span className="text-[10px] font-medium">
                                {msg.messageType === 'button_reply' ? 'رد زر' : 'اختيار قائمة'}
                              </span>
                            </div>
                            <div
                              className={`inline-block text-[12px] font-medium py-1 px-3 rounded-full border ${
                                isOutbound
                                  ? 'border-gray-300 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                                  : 'border-white/40 text-white bg-white/20'
                              }`}
                            >
                              {(msg.content ?? '')
                                .replace(/^🔘\s*/, '')
                                .replace(/^📋\s*/, '')
                                .replace(/\s*\(ID:.*\)$/, '')}
                            </div>
                          </div>
                        ) : msg.messageType === 'image' ? (
                          /* عرض الصور */
                          <div>
                            {msg.mediaId ? (
                              <LazyImage
                                src={`/api/whatsapp/media/${msg.mediaId}`}
                                alt={msg.content ?? ''}
                                className="max-w-full h-auto rounded"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Image className="h-8 w-8" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'video' ? (
                          /* عرض الفيديو */
                          <div>
                            {msg.mediaId ? (
                              <video
                                src={`/api/whatsapp/media/${msg.mediaId}`}
                                controls
                                className="max-w-full h-auto rounded"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Video className="h-8 w-8" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'audio' ? (
                          /* عرض الصوت */
                          <div>
                            {msg.mediaId ? (
                              <audio
                                src={`/api/whatsapp/media/${msg.mediaId}`}
                                controls
                                className="w-full"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <Music className="h-8 w-8" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'document' ? (
                          /* عرض الملفات */
                          <div>
                            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              {getFileIcon(msg.content ?? '')}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{msg.content}</p>
                                {msg.metadata &&
                                  (() => {
                                    try {
                                      const meta = JSON.parse(msg.metadata);
                                      return (
                                        meta.fileSize && (
                                          <p className="text-[10px] text-muted-foreground">
                                            {formatFileSize(meta.fileSize)}
                                          </p>
                                        )
                                      );
                                    } catch {
                                      return null;
                                    }
                                  })()}
                              </div>
                              <div className="flex gap-1">
                                {msg.mediaId && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        window.open(`/api/whatsapp/media/${msg.mediaId}`, '_blank');
                                      }}
                                      title="معاينة"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `/api/whatsapp/media/${msg.mediaId}`;
                                        link.download = msg.content ?? 'file';
                                        link.click();
                                      }}
                                      title="تحميل"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : msg.messageType === 'location' ? (
                          /* عرض الموقع */
                          <div>
                            {msg.metadata ? (
                              (() => {
                                try {
                                  const meta = JSON.parse(msg.metadata);
                                  const { latitude, longitude, name, address } = meta;
                                  return (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-6 w-6" />
                                        <span className="font-medium">{name || 'موقع'}</span>
                                      </div>
                                      {address && <div className="text-xs mb-2">{address}</div>}
                                      <a
                                        href={`https://maps.google.com/?q=${latitude},${longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline text-xs"
                                      >
                                        عرض في الخريطة
                                      </a>
                                    </div>
                                  );
                                } catch {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-8 w-8" />
                                      <span className="text-sm">{msg.content}</span>
                                    </div>
                                  );
                                }
                              })()
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-8 w-8" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'sticker' ? (
                          /* عرض الملصقات */
                          <div>
                            {msg.mediaId ? (
                              <img
                                src={`/api/whatsapp/media/${msg.mediaId}`}
                                alt={msg.content || 'ملصق'}
                                className="w-32 h-32 object-contain rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-4xl">🎨</span>
                                <span className="text-sm">ملصق</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'reaction' ? (
                          /* عرض الردود العاطفية */
                          <div className="flex items-center gap-1 text-lg">
                            <span>{msg.content || '😀'}</span>
                          </div>
                        ) : msg.messageType === 'order' ? (
                          /* عرض الطلبات */
                          <div>
                            {msg.metadata ? (
                              (() => {
                                try {
                                  const orderData = JSON.parse(msg.metadata);
                                  return (
                                    <div
                                      className={`p-3 rounded-lg ${isOutbound ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white/20'}`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <ShoppingCart
                                          className={`h-5 w-5 ${isOutbound ? 'text-blue-600' : 'text-white'}`}
                                        />
                                        <span className="font-semibold">طلب جديد</span>
                                      </div>
                                      <p className="text-sm">{orderData.text || msg.content}</p>
                                    </div>
                                  );
                                } catch {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <ShoppingCart className="h-5 w-5" />
                                      <span className="text-sm">{msg.content}</span>
                                    </div>
                                  );
                                }
                              })()
                            ) : (
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'product_enquiry' ? (
                          /* عرض استفسارات المنتجات */
                          <div>
                            {msg.metadata ? (
                              (() => {
                                try {
                                  const productData = JSON.parse(msg.metadata);
                                  return (
                                    <div
                                      className={`p-3 rounded-lg ${isOutbound ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white/20'}`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <Search
                                          className={`h-5 w-5 ${isOutbound ? 'text-purple-600' : 'text-white'}`}
                                        />
                                        <span className="font-semibold">استفسار عن منتج</span>
                                      </div>
                                      <p className="text-sm">
                                        Catalog ID: {productData.catalog_id || 'غير محدد'}
                                      </p>
                                    </div>
                                  );
                                } catch {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <Search className="h-5 w-5" />
                                      <span className="text-sm">{msg.content}</span>
                                    </div>
                                  );
                                }
                              })()
                            ) : (
                              <div className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : msg.messageType === 'referral' ? (
                          /* عرض مصدر الإحالة */
                          <div>
                            {msg.metadata ? (
                              (() => {
                                try {
                                  const referralData = JSON.parse(msg.metadata);
                                  return (
                                    <div
                                      className={`p-3 rounded-lg ${isOutbound ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white/20'}`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <Megaphone
                                          className={`h-5 w-5 ${isOutbound ? 'text-green-600' : 'text-white'}`}
                                        />
                                        <span className="font-semibold">إحالة من إعلان</span>
                                      </div>
                                      <p className="text-sm">
                                        {referralData.headline || msg.content}
                                      </p>
                                      {referralData.sourceUrl && (
                                        <a
                                          href={referralData.sourceUrl}
                                          className={`text-xs ${isOutbound ? 'text-blue-600' : 'text-blue-300'}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {referralData.sourceUrl}
                                        </a>
                                      )}
                                    </div>
                                  );
                                } catch {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <Megaphone className="h-5 w-5" />
                                      <span className="text-sm">{msg.content}</span>
                                    </div>
                                  );
                                }
                              })()
                            ) : (
                              <div className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="whitespace-pre-wrap break-words leading-relaxed"
                            style={{ fontSize: `${messageFontSize}px` }}
                          >
                            {searchQuery ? highlightText(msg.content ?? '', searchQuery) : msg.content ?? ''}
                          </div>
                        )}
                        <div
                          className={`flex items-center justify-between mt-1 text-[10px] sm:text-xs ${isOutbound ? 'text-muted-foreground' : 'text-white/80'}`}
                        >
                          <span>
                            {new Date(msg.sentAt ?? msg.createdAt ?? Date.now()).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <div className="flex items-center gap-1">
                            {isOutbound &&
                              (msg.status === 'failed' ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-1 cursor-help">
                                      {getStatusIcon('failed')}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                                    {msg.errorTitle || 'فشل الإرسال'}
                                    {msg.errorCode && ` (${msg.errorCode})`}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="ml-1">
                                  {getStatusIcon(msg.status || 'pending')}
                                </span>
                              ))}
                            {/* Message actions menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleReply(msg)}>
                                  <Reply className="h-3.5 w-3.5 ml-2" />
                                  رد
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReact(msg)}>
                                  <span className="text-lg ml-2">😀</span>
                                  رد عاطفي
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleForward(msg)}>
                                  <Forward className="h-3.5 w-3.5 ml-2" />
                                  إعادة توجيه
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (msg.content) {
                                      navigator.clipboard.writeText(msg.content);
                                      toast.success('تم نسخ النص');
                                    }
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5 ml-2" />
                                  نسخ النص
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (msg.content) {
                                      if (navigator.share) {
                                        navigator.share({
                                          title: 'رسالة واتساب',
                                          text: msg.content,
                                        });
                                      } else {
                                        navigator.clipboard.writeText(msg.content);
                                        toast.success('تم نسخ النص للمشاركة');
                                      }
                                    }
                                  }}
                                >
                                  <Share2 className="h-3.5 w-3.5 ml-2" />
                                  مشاركة
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(msg)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            {/* Bottom spacer for virtual scrolling */}
            <div style={{ height: (localMessages.length - visibleRange.end) * 100 }} />
            {/* Typing indicator */}
            {isContactTyping && (
              <div className="flex justify-end">
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm flex items-center gap-1.5 max-w-[120px]">
                  <span className="text-xs text-muted-foreground">{contactName || 'العميل'}</span>
                  <div className="flex gap-0.5 items-center">
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 24-hour window warning */}
      {outsideWindow && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-700 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>
            انتهت نافذة الـ 24 ساعة — لا يمكن إرسال رسائل عادية. استخدم قالباً معتمداً من Meta.
          </span>
        </div>
      )}

      {/* Selection mode toolbar */}
      {isSelectionMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-700 px-3 py-2 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span>تم تحديد {selectedMessages.size} رسالة</span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelectedMessages}
              disabled={selectedMessages.size === 0}
            >
              <Trash2 className="h-3 w-3 ml-1" />
              حذف
            </Button>
            <Button variant="outline" size="sm" onClick={toggleSelectionMode}>
              إلغاء
            </Button>
          </div>
        </div>
      )}

      <div className="border-t dark:border-gray-700 p-2 sm:p-3 bg-white dark:bg-gray-900">
        {/* Reply indicator */}
        {replyToMessage && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Reply className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-300 truncate max-w-[150px] sm:max-w-[200px]">
                رد على: {replyToMessage.content ? `${replyToMessage.content.substring(0, 30)}...` : 'رسالة'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyToMessage(null)}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0"
            >
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}

        {/* Attached file indicator */}
        {attachedFile && (
          <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-green-700 dark:text-green-300 truncate max-w-[150px] sm:max-w-[200px]">
                {attachedFile.name}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                ({(attachedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0"
            >
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span className="text-red-700 dark:text-red-300">جاري التسجيل...</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopRecording}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0"
            >
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </Button>
          </div>
        )}

        {/* Link preview */}
        {linkPreview && (
          <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3 border border-blue-200 dark:border-blue-800">
            {linkPreview.image && (
              <img
                src={linkPreview.image}
                alt=""
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 truncate mb-1">
                {linkPreview.title}
              </p>
              {linkPreview.description && (
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2">
                  {linkPreview.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate flex-1">
                  {linkPreview.url}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(linkPreview.url);
                    toast.success('تم نسخ الرابط');
                  }}
                  title="نسخ الرابط"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLinkPreview(null)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        {outsideWindow ? (
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-between text-xs sm:text-sm"
                  disabled={sendTemplateMutation.isPending}
                >
                  <span className="truncate">اختر قالباً معتمداً لإرسال الرسالة</span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {!templates || templates.length === 0 ? (
                  <DropdownMenuItem disabled>لا توجد قوالب متاحة</DropdownMenuItem>
                ) : (
                  templates
                    .filter((t) => t.isActive === 1)
                    .map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => handleSendTemplate(t)}
                        className="flex flex-col items-start gap-1 py-2"
                      >
                        <span className="font-medium text-sm">{t.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {t.content}
                        </span>
                      </DropdownMenuItem>
                    ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {sendTemplateMutation.isPending && (
              <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="31.4 31.4"
                  fill="none"
                />
              </svg>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Text input field at the top */}
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={messageText}
              onChange={(e) => handleMessageTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm sm:text-base"
            />
            {/* Attachment icons in a row below */}
            <div className="flex gap-2 items-center justify-between">
              {/* Left side: File attachments */}
              <div className="flex gap-2 items-center">
                {/* Attach file button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="إرفاق ملف"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                {/* Schedule message button */}
                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9" title="جدولة رسالة">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>جدولة رسالة</DialogTitle>
                      <DialogDescription>حدد تاريخ ووقت إرسال الرسالة</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="scheduled-message">الرسالة</Label>
                        <Textarea
                          id="scheduled-message"
                          placeholder="اكتب الرسالة المراد جدولتها..."
                          value={scheduledMessage}
                          onChange={(e) => setScheduledMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="scheduled-date">التاريخ والوقت</Label>
                        <Input
                          id="scheduled-date"
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleScheduleMessage}>جدولة</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Forward dialog */}
                <Dialog open={forwardDialogOpen} onOpenChange={setForwardDialogOpen}>
                  <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إعادة توجيه الرسالة</DialogTitle>
                      <DialogDescription>
                        اختر المحادثة المراد إعادة توجيه الرسالة إليها
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      {messageToForward && (
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">الرسالة:</p>
                          <p className="text-sm">{messageToForward.content}</p>
                        </div>
                      )}
                      <div className="max-h-[300px] overflow-y-auto">
                        {allConversations && allConversations.length > 0 ? (
                          allConversations
                            .filter((conv) => conv.id !== conversationId)
                            .map((conv) => (
                              <button
                                key={conv.id}
                                onClick={() => handleForwardToConversation(conv.id)}
                                className="w-full text-right p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mb-2 transition-colors"
                              >
                                <div className="font-medium text-sm">
                                  {conv.customerName || 'عميل جديد'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {conv.phoneNumber}
                                </div>
                              </button>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">
                            لا توجد محادثات متاحة
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setForwardDialogOpen(false)}>
                        إلغاء
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Audio preview dialog */}
                <Dialog open={isAudioPreviewOpen} onOpenChange={setIsAudioPreviewOpen}>
                  <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>معاينة الرسالة الصوتية</DialogTitle>
                      <DialogDescription>
                        مدة التسجيل: {Math.floor(recordingDuration / 60)}:
                        {(recordingDuration % 60).toString().padStart(2, '0')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      {recordedAudio && (
                        <audio
                          src={URL.createObjectURL(recordedAudio)}
                          controls
                          className="w-full"
                        />
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={cancelRecording}>
                        إلغاء
                      </Button>
                      <Button onClick={sendRecordedAudio}>إرسال</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Reaction dialog */}
                <Dialog open={reactionDialogOpen} onOpenChange={setReactionDialogOpen}>
                  <DialogContent className="sm:max-w-sm" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>اختر رد عاطفي</DialogTitle>
                      <DialogDescription>اختر التفاعل المناسب لهذه الرسالة</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="grid grid-cols-6 gap-2">
                        {reactions.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleSendReaction(emoji)}
                            className="text-3xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setReactionDialogOpen(false)}>
                        إلغاء
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Media gallery dialog */}
                <Dialog open={isMediaGalleryOpen} onOpenChange={handleCloseMediaGallery}>
                  <DialogContent className="sm:max-w-4xl max-h-[80vh]" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>معرض الوسائط</DialogTitle>
                      <DialogDescription>جميع الصور والفيديوهات في هذه المحادثة</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 overflow-y-auto max-h-[60vh]">
                      {getMediaMessages().length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>لا توجد وسائط في هذه المحادثة</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {getMediaMessages().map((media: Message) => (
                            <div key={media.id} className="relative group">
                              {media.messageType === 'image' ? (
                                <img
                                  src={`/api/whatsapp/media/${media.mediaId}`}
                                  alt={media.content ?? ''}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedMedia(media)}
                                />
                              ) : (
                                <video
                                  src={`/api/whatsapp/media/${media.mediaId}`}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedMedia(media)}
                                />
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-white hover:bg-white/20"
                                  onClick={() => handleDownloadMedia(media)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-white hover:bg-white/20"
                                  onClick={() => handleDeleteMedia(media)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleCloseMediaGallery}>
                        إغلاق
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Media preview dialog */}
                {selectedMedia && (
                  <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
                    <DialogContent className="sm:max-w-4xl" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>معاينة الوسائط</DialogTitle>
                        <DialogDescription>{selectedMedia.content || 'وسائط'}</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        {selectedMedia.messageType === 'image' ? (
                          <img
                            src={`/api/whatsapp/media/${selectedMedia.mediaId}`}
                            alt={selectedMedia.content ?? ''}
                            className="w-full max-h-[60vh] object-contain rounded-lg"
                          />
                        ) : (
                          <video
                            src={`/api/whatsapp/media/${selectedMedia.mediaId}`}
                            controls
                            className="w-full max-h-[60vh] object-contain rounded-lg"
                          />
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadMedia(selectedMedia)}
                        >
                          <Download className="h-4 w-4 ml-2" />
                          تحميل
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteMedia(selectedMedia)}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedMedia(null)}>
                          إغلاق
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Sticker library dialog */}
                <Dialog open={isStickerLibraryOpen} onOpenChange={setIsStickerLibraryOpen}>
                  <DialogContent className="sm:max-w-2xl max-h-[80vh]" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>مكتبة الملصقات</DialogTitle>
                      <DialogDescription>اختر ملصقاً لإرساله</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 overflow-y-auto max-h-[60vh]">
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {customStickers.map((sticker, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setMessageText((prev) => prev + sticker);
                              setIsStickerLibraryOpen(false);
                            }}
                            className="text-4xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {sticker}
                          </button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsStickerLibraryOpen(false)}>
                        إغلاق
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Export button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="تصدير المحادثة"
                  onClick={handleExportConversation}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {/* Search button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="البحث في المحادثة"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {/* Media gallery button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="معرض الوسائط"
                  onClick={handleOpenMediaGallery}
                >
                  <Image className="h-4 w-4" />
                </Button>
                {/* Sticker library button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="مكتبة الملصقات"
                  onClick={() => setIsStickerLibraryOpen(true)}
                >
                  <span className="text-2xl">🎨</span>
                </Button>
                {/* Selection mode button */}
                <Button
                  variant={isSelectionMode ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  title={isSelectionMode ? 'إلغاء التحديد' : 'تحديد رسائل متعددة'}
                  onClick={toggleSelectionMode}
                >
                  {isSelectionMode ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
                {/* Voice recording button */}
                {isRecording ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 animate-pulse"
                    title="إيقاف التسجيل"
                    onClick={stopRecording}
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    title="تسجيل رسالة صوتية"
                    onClick={startRecording}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {/* Right side: Formatting and send */}
              <div className="flex gap-2 items-center">
                {/* Font size buttons */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    title="تصغير الخط"
                    onClick={() => handleFontSizeChange(-1)}
                    disabled={messageFontSize <= 12}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    title="تكبير الخط"
                    onClick={() => handleFontSizeChange(1)}
                    disabled={messageFontSize >= 20}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* Night mode button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title={isNightMode ? 'الوضع الفاتح' : 'الوضع الليلي'}
                  onClick={handleToggleNightMode}
                >
                  {isNightMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                {/* Quick Replies button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      title="الردود السريعة"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {!quickReplies || quickReplies.length === 0 ? (
                      <DropdownMenuItem disabled>لا توجد ردود سريعة</DropdownMenuItem>
                    ) : (
                      quickReplies
                        .filter((r) => r.isActive === 1)
                        .map((r) => (
                          <DropdownMenuItem
                            key={r.id}
                            onClick={() => handleInsertQuickReply(r.content)}
                            className="flex flex-col items-start gap-1 py-2"
                          >
                            <span className="font-medium text-sm">{r.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {r.content}
                            </span>
                          </DropdownMenuItem>
                        ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Template button - always available */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      disabled={sendTemplateMutation.isPending}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {!templates || templates.length === 0 ? (
                      <DropdownMenuItem disabled>لا توجد قوالب متاحة</DropdownMenuItem>
                    ) : (
                      (templates as Template[])
                        .filter((t) => t.isActive)
                        .map((t) => (
                          <DropdownMenuItem
                            key={t.id}
                            onClick={() => handleSendTemplate(t)}
                            className="flex flex-col items-start gap-1 py-2"
                          >
                            <span className="font-medium text-sm">{t.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {t.content}
                            </span>
                          </DropdownMenuItem>
                        ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && !attachedFile) || sendMessageMutation.isPending}
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                >
                  {sendMessageMutation.isPending ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="31.4 31.4"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 transform rotate-90" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M2 21l21-9L2 3v7l15 2-15 2z" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
