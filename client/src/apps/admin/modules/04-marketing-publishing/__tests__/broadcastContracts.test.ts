import { describe, expect, it } from "vitest";
import {
  buildContactExportInput,
  buildContactListInput,
  buildBroadcastContentSuggestion,
  buildGoogleSyncInput,
  buildRecipientQueryInput,
  buildSendRecipients,
  applyContentSuggestionToVariables,
  initializeTemplateVariables,
} from "@/lib/broadcastContracts";

describe("broadcast contracts", () => {
  it("converts selected source keys to the getRecipients input", () => {
    expect(
      buildRecipientQueryInput(["doctor_12", "camp_7", "offer_9", "all_leads"])
    ).toEqual({
      doctorIds: [12],
      campIds: [7],
      offerIds: [9],
      includeAllLeads: true,
    });
  });

  it("ignores malformed source keys instead of sending NaN ids", () => {
    expect(buildRecipientQueryInput(["doctor_bad", "camp_", "offer_3"])).toEqual({
      doctorIds: [],
      campIds: [],
      offerIds: [3],
      includeAllLeads: false,
    });
  });

  it("keeps name automatic and exposes manual body/button variables", () => {
    expect(
      initializeTemplateVariables({
        id: 270001,
        variables: ["name", "announcement_text"],
        buttons: [{ type: "URL", url: "https://example.com/{{1}}" }],
      })
    ).toEqual({ announcement_text: "", button_0: "" });
  });

  it("builds the exact recipient payload accepted by sendBroadcast", () => {
    expect(
      buildSendRecipients([
        { phone: "0500000000", fullName: "عميل 1", source: "appointments", sourceId: 1 },
      ])
    ).toEqual([{ phone: "0500000000", fullName: "عميل 1", source: "appointments" }]);
  });

  it("builds a real all-source contact list query and trims search", () => {
    expect(buildContactListInput("  أحمد  ")).toEqual({
      page: 1,
      limit: 100,
      search: "أحمد",
      recipientSources: ["appointments", "camp_registrations", "offer_leads", "leads"],
      statuses: undefined,
    });
  });

  it("builds export and Google sync inputs with all real contact sources", () => {
    expect(buildContactExportInput("csv")).toEqual({
      exportType: "csv",
      filterCriteria: {
        recipientSources: ["appointments", "camp_registrations", "offer_leads", "leads"],
        statuses: undefined,
      },
    });
    expect(buildGoogleSyncInput("  token  ")).toEqual({
      accessToken: "token",
      filterCriteria: {
        recipientSources: ["appointments", "camp_registrations", "offer_leads", "leads"],
        statuses: undefined,
      },
    });
    expect(buildContactListInput('', ["appointments"], ["confirmed"])).toEqual({
      page: 1,
      limit: 100,
      search: undefined,
      recipientSources: ["appointments"],
      statuses: ["confirmed"],
    });
  });

  it("builds a doctor suggestion with the public page, image, and editable template fields", () => {
    const suggestion = buildBroadcastContentSuggestion({
      kind: "doctor",
      id: 8,
      title: "د. صخر الفقية",
      slug: "Dr-Sakhr-Al-Faqih",
      specialty: "جراحة عامة",
      imageUrl: "https://cdn.example.com/sakhr.jpg",
    });

    expect(suggestion).toMatchObject({
      pageUrl: "https://sghsanaa.net/doctors/Dr-Sakhr-Al-Faqih",
      imageUrl: "https://cdn.example.com/sakhr.jpg",
    });
    expect(suggestion.announcementText).toContain("د. صخر الفقية");
    expect(applyContentSuggestionToVariables({ announcement_text: "", button_0: "" }, suggestion)).toEqual({
      announcement_text: suggestion.announcementText,
      button_0: suggestion.pageUrl,
    });
  });

  it("builds fallback page links for camp and offer content sources", () => {
    expect(buildBroadcastContentSuggestion({ kind: "camp", id: 4, title: "مخيم العيون", slug: "eye-camp" }).pageUrl)
      .toBe("https://sghsanaa.net/camps/eye-camp");
    expect(buildBroadcastContentSuggestion({ kind: "offer", id: 7, title: "عرض الأسنان" }).pageUrl)
      .toBe("https://sghsanaa.net/offers/7");
  });
});
