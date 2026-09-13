import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BroadcastHistoryList } from "../Broadcasts";

const broadcast = {
  id: 1,
  name: "بث مجدول تجريبي",
  status: "scheduled",
  createdAt: new Date("2026-08-14T04:00:00Z"),
  scheduledAt: new Date("2026-08-14T08:00:00Z"),
  scheduleCronTaskUid: "task-1",
  recipientCount: 2,
  sentCount: 0,
  failedCount: 0,
  heartbeat: { status: "active", nextExecutionAt: "2026-08-14T08:00:00Z" },
};

describe("BroadcastHistoryList", () => {
  it("renders the live scheduled-task status and opens tracking details", () => {
    const onOpenDetails = vi.fn();
    render(React.createElement(BroadcastHistoryList, { broadcasts: [broadcast], isLoading: false, emptyText: "لا توجد سجلات", showSchedule: true, onOpenDetails }));

    expect(screen.getByText("حالة المهمة: نشطة", { exact: false })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /التتبع/i }));
    expect(onOpenDetails).toHaveBeenCalledWith(1);
  });

  it("shows the loading and empty states without rendering a tracking action", () => {
    const { rerender } = render(React.createElement(BroadcastHistoryList, { broadcasts: [], isLoading: true, emptyText: "لا توجد سجلات", onOpenDetails: vi.fn() }));
    expect(screen.getByText(/جاري تحميل سجل البث/i)).toBeTruthy();

    rerender(React.createElement(BroadcastHistoryList, { broadcasts: [], isLoading: false, emptyText: "لا توجد سجلات", onOpenDetails: vi.fn() }));
    expect(screen.getByText("لا توجد سجلات")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /التتبع/i })).toBeNull();
  });

  it("shows a clear error state when the broadcast query fails", () => {
    render(React.createElement(BroadcastHistoryList, {
      broadcasts: [],
      isLoading: false,
      error: new Error("تعذّر الاتصال بالخادم"),
      emptyText: "لا توجد سجلات",
      onOpenDetails: vi.fn(),
    }));

    expect(screen.getByText(/تعذّر تحميل سجل البث/i)).toBeTruthy();
    expect(screen.getByText(/تعذّر الاتصال بالخادم/i)).toBeTruthy();
  });
});
