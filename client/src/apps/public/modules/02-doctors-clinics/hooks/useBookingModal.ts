import { useSyncExternalStore } from 'react';

export interface BookingPrefill {
  fullName?: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female';
  age?: number;
  notes?: string;
  patientId?: number;
}

export interface BookingModalOptions {
  doctorId?: number;
  departmentId?: number;
  preferredDate?: string;
  prefill?: BookingPrefill;
}

interface BookingModalState extends BookingModalOptions {
  isOpen: boolean;
}

let state: BookingModalState = {
  isOpen: false,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
}

export const bookingModalStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  open: (options?: BookingModalOptions) => {
    state = {
      isOpen: true,
      doctorId: options?.doctorId,
      departmentId: options?.departmentId,
      preferredDate: options?.preferredDate,
      prefill: options?.prefill,
    };
    emitChange();
  },
  close: () => {
    state = {
      ...state,
      isOpen: false,
    };
    emitChange();
  },
};

/**
 * Hook to control opening/closing the unified Booking Modal anywhere in the app
 */
export function useBookingModal() {
  const modalState = useSyncExternalStore(
    bookingModalStore.subscribe,
    bookingModalStore.getSnapshot
  );

  return {
    ...modalState,
    openBookingModal: bookingModalStore.open,
    closeBookingModal: bookingModalStore.close,
  };
}
