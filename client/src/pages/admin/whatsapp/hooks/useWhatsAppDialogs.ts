/**
 * useWhatsAppDialogs - Custom hook لإدارة جميع Dialogs
 * يتولى حالة جميع نوافذ الحوار في صفحة WhatsApp
 */

import { useState, useCallback } from 'react';
import { ExportFormatType } from '../types/whatsapp.types';

export function useWhatsAppDialogs() {
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [autoReplyDialogOpen, setAutoReplyDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [searchInConversationOpen, setSearchInConversationOpen] = useState(false);
  const [searchInConversationTerm, setSearchInConversationTerm] = useState('');
  const [exportConversationOpen, setExportConversationOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormatType>('json');

  const handleOpenSaveSearch = useCallback(() => {
    setSaveSearchOpen(true);
  }, []);

  const handleCloseSaveSearch = useCallback(() => {
    setSaveSearchOpen(false);
    setSearchName('');
  }, []);

  const handleOpenAutoReply = useCallback(() => {
    setAutoReplyDialogOpen(true);
  }, []);

  const handleCloseAutoReply = useCallback(() => {
    setAutoReplyDialogOpen(false);
  }, []);

  const handleOpenNotes = useCallback((notes: string) => {
    setNotesValue(notes);
    setNotesDialogOpen(true);
  }, []);

  const handleCloseNotes = useCallback(() => {
    setNotesDialogOpen(false);
    setNotesValue('');
  }, []);

  const handleOpenSearchInConversation = useCallback(() => {
    setSearchInConversationOpen(true);
    setSearchInConversationTerm('');
  }, []);

  const handleCloseSearchInConversation = useCallback(() => {
    setSearchInConversationOpen(false);
    setSearchInConversationTerm('');
  }, []);

  const handleOpenExportConversation = useCallback(() => {
    setExportConversationOpen(true);
    setExportFormat('json');
  }, []);

  const handleCloseExportConversation = useCallback(() => {
    setExportConversationOpen(false);
    setExportFormat('json');
  }, []);

  return {
    // Save Search Dialog
    saveSearchOpen,
    searchName,
    setSearchName,
    handleOpenSaveSearch,
    handleCloseSaveSearch,

    // Auto Reply Dialog
    autoReplyDialogOpen,
    handleOpenAutoReply,
    handleCloseAutoReply,

    // Notes Dialog
    notesDialogOpen,
    notesValue,
    setNotesValue,
    handleOpenNotes,
    handleCloseNotes,

    // Search in Conversation Dialog
    searchInConversationOpen,
    searchInConversationTerm,
    setSearchInConversationTerm,
    handleOpenSearchInConversation,
    handleCloseSearchInConversation,

    // Export Conversation Dialog
    exportConversationOpen,
    exportFormat,
    setExportFormat,
    handleOpenExportConversation,
    handleCloseExportConversation,
  };
}
