import React, { memo, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Paperclip,
  Mic,
  MicOff,
  Send,
  Smile,
  Calendar,
  Reply,
  X,
  MoreHorizontal,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Message, LinkPreview, Template } from './types';
import { ChatMessageService } from '@/services/chatMessageService';

interface ChatInputProps {
  conversationId: number | null;
  phone: string | null;
  templates: Template[] | undefined;
  quickReplies: string[] | undefined;
  outsideWindow: boolean;
  replyToMessage: Message | null;
  onSendMessage: (content: string, file?: File | undefined, replyTo?: Message | undefined) => void;
  onSendTemplate: (templateId: string, phone: string) => void;
  onCancelReply: () => void;
  onScheduleMessage: (content: string, date: string) => void;
  onForwardMessage: (message: Message, conversationId: number) => void;
  allConversations: { id: number; phone?: string | null }[] | undefined;
  _activeUsers: { id: number; name: string | null; username: string }[] | undefined;
}

export const ChatInput = memo(
  ({
    conversationId,
    phone,
    templates,
    quickReplies,
    outsideWindow,
    replyToMessage,
    onSendMessage,
    onSendTemplate,
    onCancelReply,
    onScheduleMessage,
    onForwardMessage,
    allConversations,
    _activeUsers,
  }: ChatInputProps) => {
    const [messageText, setMessageText] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
    const [isAudioPreviewOpen, setIsAudioPreviewOpen] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Link preview
    const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
    const [_isFetchingLinkPreview, _setIsFetchingLinkPreview] = useState(false);

    // Scheduled message
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [scheduledMessage, setScheduledMessage] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    // Forward message
    const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
    const [messageToForward, setMessageToForward] = useState<Message | null>(null);
    const [selectedForwardConversation, setSelectedForwardConversation] = useState<number | null>(
      null
    );

    // Sticker library
    const [_isStickerLibraryOpen, _setIsStickerLibraryOpen] = useState(false);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      const validation = ChatMessageService.validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setAttachedFile(file);
    }, []);

    const handleRemoveFile = useCallback(() => {
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, []);

    const handleSendMessage = useCallback(() => {
      if (!messageText.trim() && !attachedFile) {
        return;
      }
      if (!conversationId) {
        toast.error('يرجى اختيار محادثة أولاً');
        return;
      }

      onSendMessage(messageText, attachedFile || undefined, replyToMessage || undefined);
      setMessageText('');
      setAttachedFile(null);
      setLinkPreview(null);
      onCancelReply();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, [messageText, attachedFile, conversationId, onSendMessage, replyToMessage, onCancelReply]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      },
      [handleSendMessage]
    );

    const handleMessageTextChange = useCallback(
      (text: string) => {
        setMessageText(text);

        const url = ChatMessageService.extractUrl(text);
        if (url && url !== linkPreview?.url) {
          ChatMessageService.fetchLinkPreview(url).then((preview) => {
            setLinkPreview(preview);
          });
        } else if (!url) {
          setLinkPreview(null);
        }
      },
      [linkPreview?.url]
    );

    // Voice recording
    const startRecording = useCallback(async () => {
      const recorder = await ChatMessageService.startVoiceRecording(
        (blob) => {
          setRecordedAudio(blob);
          setIsAudioPreviewOpen(true);
        },
        (error) => {
          toast.error(error);
        }
      );

      if (recorder) {
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingDuration(0);

        recordingIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
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

    const sendRecordedAudio = useCallback(() => {
      if (!recordedAudio || !conversationId) {
        return;
      }

      const file = new File([recordedAudio], 'audio.webm', { type: 'audio/webm' });
      onSendMessage('', file);
      cancelRecording();
    }, [recordedAudio, conversationId, onSendMessage, cancelRecording]);

    // Template sending
    const handleSendTemplate = useCallback(
      (templateId: string) => {
        if (!phone) {
          toast.error('رقم الهاتف غير متوفر');
          return;
        }
        onSendTemplate(templateId, phone);
      },
      [phone, onSendTemplate]
    );

    // Scheduled message
    const handleScheduleMessage = useCallback(() => {
      if (!scheduledMessage.trim() || !scheduledDate) {
        toast.error('يرجى إدخال الرسالة والتاريخ');
        return;
      }
      onScheduleMessage(scheduledMessage, scheduledDate);
      setScheduleDialogOpen(false);
      setScheduledMessage('');
      setScheduledDate('');
    }, [scheduledMessage, scheduledDate, onScheduleMessage]);

    // Forward message
    const _handleForward = useCallback((message: Message) => {
      setMessageToForward(message);
      setForwardDialogOpen(true);
    }, []);

    const handleConfirmForward = useCallback(() => {
      if (!messageToForward || !selectedForwardConversation) {
        toast.error('يرجى اختيار المحادثة');
        return;
      }
      onForwardMessage(messageToForward, selectedForwardConversation);
      setForwardDialogOpen(false);
      setMessageToForward(null);
      setSelectedForwardConversation(null);
    }, [messageToForward, selectedForwardConversation, onForwardMessage]);

    // Quick replies
    const handleQuickReply = useCallback((reply: string) => {
      setMessageText(reply);
    }, []);

    const _customStickers = ChatMessageService.getCustomStickers();

    return (
      <div className="shrink-0 border-t border-gray-200 bg-white p-2.5 [padding-bottom:max(0.625rem,env(safe-area-inset-bottom))] dark:border-gray-700 dark:bg-gray-800 sm:p-4">
        {/* Reply preview */}
        {replyToMessage && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Reply className="h-4 w-4 text-blue-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">الرد على:</p>
              <p className="text-sm line-clamp-1">{replyToMessage.content}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancelReply}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Link preview */}
        {linkPreview && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex gap-2">
              {linkPreview.image && (
                <img src={linkPreview.image} alt="" className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{linkPreview.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{linkPreview.description}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLinkPreview(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Attached file preview */}
        {attachedFile && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
            <span className="text-2xl">{ChatMessageService.getFileIcon(attachedFile.name)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{attachedFile.name}</p>
              <p className="text-xs text-gray-500">
                {ChatMessageService.formatFileSize(attachedFile.size)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          {/* Attach file button */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="hidden h-10 w-10 shrink-0 sm:inline-flex"
            aria-label="إرفاق ملف"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {/* Text input */}
          <Textarea
            value={messageText}
            onChange={(e) => handleMessageTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={outsideWindow ? 'أرسل قالب أولاً لفتح نافذة الكتابة' : 'اكتب رسالة...'}
            className="min-h-[44px] max-h-[120px] flex-1 resize-none rounded-2xl px-3 py-2 text-sm"
            disabled={outsideWindow}
          />

          {/* Voice recording button */}
          {!messageText.trim() && !attachedFile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`h-10 w-10 shrink-0 ${isRecording ? 'text-red-500' : ''}`}
              aria-label={isRecording ? 'إيقاف التسجيل الصوتي' : 'تسجيل رسالة صوتية'}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          ) : null}

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() && !attachedFile}
            className="h-10 w-10 shrink-0 rounded-full p-0 sm:w-auto sm:rounded-md sm:px-3"
            aria-label="إرسال الرسالة"
          >
            <Send className="h-4 w-4 sm:ml-2 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">إرسال</span>
          </Button>

          {/* Additional actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="إجراءات إضافية"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="sm:hidden" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="ml-2 h-4 w-4" />
                إرفاق ملف
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setScheduleDialogOpen(true)}>
                <Calendar className="h-4 w-4 ml-2" />
                جدولة رسالة
              </DropdownMenuItem>

              {templates && templates.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {templates.slice(0, 5).map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => handleSendTemplate(String(template.id))}
                    >
                      <Smile className="h-4 w-4 ml-2" />
                      {template.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {quickReplies && quickReplies.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {quickReplies.slice(0, 5).map((reply, index) => (
                    <DropdownMenuItem key={index} onClick={() => handleQuickReply(reply)}>
                      <Reply className="h-4 w-4 ml-2" />
                      {reply}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>
              جاري التسجيل: {ChatMessageService.formatRecordingDuration(recordingDuration)}
            </span>
            <Button variant="ghost" size="sm" onClick={cancelRecording}>
              إلغاء
            </Button>
          </div>
        )}

        {/* Audio preview dialog */}
        <Dialog open={isAudioPreviewOpen} onOpenChange={setIsAudioPreviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>معاينة التسجيل الصوتي</DialogTitle>
            </DialogHeader>
            {recordedAudio && (
              <audio controls src={URL.createObjectURL(recordedAudio)} className="w-full" />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={cancelRecording}>
                إلغاء
              </Button>
              <Button onClick={sendRecordedAudio}>إرسال</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule message dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>جدولة رسالة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الرسالة</Label>
                <Textarea
                  value={scheduledMessage}
                  onChange={(e) => setScheduledMessage(e.target.value)}
                  placeholder="اكتب الرسالة..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>التاريخ والوقت</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1"
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

        {/* Forward message dialog */}
        <Dialog open={forwardDialogOpen} onOpenChange={setForwardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إعادة توجيه الرسالة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اختر المحادثة</Label>
                <select
                  value={selectedForwardConversation || ''}
                  onChange={(e) => setSelectedForwardConversation(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="">اختر محادثة</option>
                  {allConversations?.map((conv) => (
                    <option key={conv.id} value={conv.id}>
                      {conv.phone || `محادثة ${conv.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setForwardDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleConfirmForward}>إعادة توجيه</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
