// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listContacts: vi.fn(),
  exportUseMutation: vi.fn(),
  exportMutate: vi.fn(),
  syncUseMutation: vi.fn(),
  syncMutate: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/api/trpc", () => ({
  trpc: {
    broadcast: {
      listContacts: { useQuery: mocks.listContacts },
      exportContacts: { useMutation: mocks.exportUseMutation },
    },
    googleSync: {
      syncContacts: { useMutation: mocks.syncUseMutation },
    },
  },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    broadcast: {
      listContacts: { useQuery: mocks.listContacts },
      exportContacts: { useMutation: mocks.exportUseMutation },
    },
    googleSync: {
      syncContacts: { useMutation: mocks.syncUseMutation },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

import { ContactsManagementTab } from "../Broadcasts";

const contactsResponse = {
  success: true,
  data: {
    contacts: [
      {
        phoneNumber: "967711223344",
        fullName: "عميل تجريبي من قاعدة البيانات",
        email: "client@example.com",
        sourceType: "appointment",
      },
    ],
    total: 1,
    page: 1,
    limit: 100,
  },
};

describe("ContactsManagementTab interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listContacts.mockReturnValue({ data: contactsResponse, isLoading: false });
    mocks.exportUseMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.exportMutate,
    });
    mocks.syncUseMutation.mockReturnValue({
      isPending: false,
      mutate: mocks.syncMutate,
    });
  });

  it("renders real contact data and sends source/status filters to the query", async () => {
    render(React.createElement(ContactsManagementTab));

    expect(screen.getByText("عميل تجريبي من قاعدة البيانات")).toBeInTheDocument();
    expect(screen.getByText("967711223344")).toBeInTheDocument();

    fireEvent.click(screen.getByText("تسجيلات المخيمات"));
    fireEvent.change(screen.getByLabelText("الحالة"), {
      target: { value: "confirmed" },
    });

    await waitFor(() => {
      const latestInput = mocks.listContacts.mock.calls.at(-1)?.[0];
      expect(latestInput.recipientSources).not.toContain("camp_registrations");
      expect(latestInput.statuses).toEqual(["confirmed"]);
    });
  });

  it("sends the selected filters to export and Google sync mutations", () => {
    render(React.createElement(ContactsManagementTab));

    fireEvent.click(screen.getByText("طلبات العروض"));
    fireEvent.click(screen.getByRole("button", { name: "CSV" }));

    expect(mocks.exportMutate).toHaveBeenCalledWith({
      exportType: "csv",
      filterCriteria: {
        recipientSources: ["appointments", "camp_registrations", "leads"],
        statuses: undefined,
      },
    });

    fireEvent.change(screen.getByLabelText("رمز وصول Google"), {
      target: { value: "google-token" },
    });
    fireEvent.click(screen.getByRole("button", { name: "مزامنة مع Google" }));

    expect(mocks.syncMutate).toHaveBeenCalledWith({
      accessToken: "google-token",
      filterCriteria: {
        recipientSources: ["appointments", "camp_registrations", "leads"],
        statuses: undefined,
      },
    });
  });

  it("shows the loading state while contacts are being fetched", () => {
    mocks.listContacts.mockReturnValueOnce({ data: undefined, isLoading: true });
    render(React.createElement(ContactsManagementTab));

    expect(screen.getByText("جاري تحميل الجهات...")).toBeInTheDocument();
  });

  it("shows query errors and reports export and sync failures", () => {
    mocks.listContacts.mockReturnValueOnce({
      data: { success: false, error: "تعذر تحميل الجهات" },
      isLoading: false,
    });
    render(React.createElement(ContactsManagementTab));

    expect(screen.getByText("تعذر تحميل الجهات")).toBeInTheDocument();

    const exportOptions = mocks.exportUseMutation.mock.calls[0]?.[0];
    const syncOptions = mocks.syncUseMutation.mock.calls[0]?.[0];
    act(() => {
      exportOptions.onError(new Error("Export failed"));
      syncOptions.onError(new Error("Google failed"));
    });

    expect(mocks.toastError).toHaveBeenCalledWith("تعذر تصدير الجهات: Export failed");
    expect(mocks.toastError).toHaveBeenCalledWith("فشلت مزامنة Google: Google failed");
  });

  it("disables export and sync actions while mutations are pending", () => {
    mocks.exportUseMutation.mockReturnValue({ isPending: true, mutate: mocks.exportMutate });
    mocks.syncUseMutation.mockReturnValue({ isPending: true, mutate: mocks.syncMutate });
    render(React.createElement(ContactsManagementTab));

    expect(screen.getByRole("button", { name: "CSV" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("رمز وصول Google"), {
      target: { value: "google-token" },
    });
    expect(screen.getByRole("button", { name: "جاري المزامنة..." })).toBeDisabled();
  });

  it("shows detailed partial-sync results inside the page", async () => {
    render(React.createElement(ContactsManagementTab));

    fireEvent.change(screen.getByLabelText("رمز وصول Google"), {
      target: { value: "google-token" },
    });
    fireEvent.click(screen.getByRole("button", { name: "مزامنة مع Google" }));

    const options = mocks.syncUseMutation.mock.calls[0]?.[0];
    act(() => {
      options.onSuccess({
        success: false,
        data: { syncedCount: 2, failedCount: 1, duplicateCount: 3, syncLogId: 42 },
        message: "اكتملت المزامنة جزئياً: نجح 2 وفشل 1 جهة اتصال",
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/تمت المزامنة: 2، فشل: 1، مكرر تم تجاوزه: 3/)).toBeInTheDocument();
    });
  });
});
