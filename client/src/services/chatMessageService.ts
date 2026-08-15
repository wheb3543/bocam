import { toast } from 'sonner';
import type { Message, LinkPreview } from '@/components/chat/types';

/**
 * Service for handling chat message operations
 * Includes file handling, link preview, search, and export functionality
 */

export class ChatMessageService {
  /**
   * Extract URL from text
   */
  static extractUrl(text: string): string | null {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  /**
   * Fetch link preview from URL
   */
  static async fetchLinkPreview(url: string): Promise<LinkPreview> {
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

        return { url, title, description, image };
      }
    } catch {
      return { url, title: url, description: '', image: '' };
    }

    return { url, title: url, description: '', image: '' };
  }

  /**
   * Get file icon based on filename extension
   */
  static getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) {return '📄';}
    if (['doc', 'docx'].includes(ext)) {return '📝';}
    if (['xls', 'xlsx'].includes(ext)) {return '📊';}
    if (['ppt', 'pptx'].includes(ext)) {return '📈';}
    if (['zip', 'rar', '7z'].includes(ext)) {return '📦';}
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {return '🖼️';}
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {return '🎬';}
    if (['mp3', 'wav', 'ogg'].includes(ext)) {return '🎵';}
    return '📄';
  }

  /**
   * Format file size in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Search messages by query
   */
  static searchMessages(messages: Message[], query: string): Array<string | number> {
    if (!query.trim()) {return [];}

    const results: Array<string | number> = [];
    messages.forEach((msg) => {
      if (msg.content && msg.content.toLowerCase().includes(query.toLowerCase()) && msg.id !== null && msg.id !== undefined) {
        results.push(msg.id);
      }
    });

    return results;
  }

  /**
   * Highlight text with search query - returns parts array for rendering
   */
  static getHighlightedParts(text: string, query: string): Array<{ text: string; isMatch: boolean }> {
    if (!query.trim()) {return [{ text, isMatch: false }];}
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part) => ({
      text: part,
      isMatch: regex.test(part),
    }));
  }

  /**
   * Get media messages (images and videos)
   */
  static getMediaMessages(messages: Message[]): Message[] {
    return messages.filter(
      (msg) => msg.messageType === 'image' || msg.messageType === 'video'
    );
  }

  /**
   * Download media file
   */
  static downloadMedia(media: Message): void {
    if (media.mediaId) {
      const link = document.createElement('a');
      link.href = `/api/whatsapp/media/${media.mediaId}`;
      link.download = media.content || 'media';
      link.click();
    }
  }

  /**
   * Export conversation to PDF
   */
  static async exportConversationToPDF(
    messages: Message[],
    contactName: string | null
  ): Promise<void> {
    try {
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
      messages.forEach((msg) => {
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
    } catch {
      toast.error('فشل تصدير المحادثة');
    }
  }

  /**
   * Start voice recording
   */
  static async startVoiceRecording(
    onAudioAvailable: (blob: Blob) => void,
    onError: (error: string) => void
  ): Promise<MediaRecorder | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onAudioAvailable(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      return mediaRecorder;
    } catch {
      onError('فشل بدء التسجيل. يرجى السماح بالوصول للميكروفون');
      return null;
    }
  }

  /**
   * Format recording duration
   */
  static formatRecordingDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get custom stickers list
   */
  static getCustomStickers(): string[] {
    return [
      '😀', '😂', '😍', '🥰', '😎', '🤩', '😊', '🥳', '😇', '🤗',
      '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '💔', '💯', '✨',
      '🎉', '🎊', '🎁', '🏆', '🥇', '🌟', '⭐', '💫', '🔥', '💥',
      '🌈', '☀️', '🌙', '⭐', '🌸', '🌺', '🌻', '🌹', '🍀', '🍁',
      '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮',
      '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪', '🎂', '🍰',
      '🚗', '🚕', '🚙', '🚌', '🏎️', '🚂', '🚁', '✈️', '🚀', '🛸',
      '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📸', '📹', '🎥', '📺',
    ];
  }

  /**
   * Get message reactions
   */
  static getMessageReactions(): string[] {
    return ['👍', '❤️', '😂', '😮', '😢', '😡'];
  }

  /**
   * Validate file for upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf'];

    if (file.size > maxSize) {
      return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى 10MB' };
    }

    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      return { valid: false, error: 'نوع الملف غير مدعوم' };
    }

    return { valid: true };
  }
}
