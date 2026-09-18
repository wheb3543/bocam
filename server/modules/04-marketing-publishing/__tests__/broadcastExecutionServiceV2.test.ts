import { describe, expect, it, vi } from "vitest";
import axios from "axios";
import {
  buildMetaTemplateComponents,
  buildMetaTemplateMessagePayload,
  getInsertedBroadcastId,
  normalizeWhatsAppRecipientPhone,
  validatePublicHeaderImageUrl,
} from "../services/broadcastExecutionServiceV2";

describe("getInsertedBroadcastId", () => {
  it("reads MySQL result headers returned as an array by Drizzle", () => {
    expect(getInsertedBroadcastId([{ insertId: 90002 }])).toBe(90002);
  });

  it("reads a direct MySQL result header and supports bigint IDs", () => {
    expect(getInsertedBroadcastId({ insertId: BigInt(90003) })).toBe(90003);
  });

  it("rejects missing insert IDs before recipient creation", () => {
    expect(() => getInsertedBroadcastId({})).toThrow("Failed to create broadcast record");
  });

  it("keeps an existing Yemen country code without duplicating it", () => {
    expect(normalizeWhatsAppRecipientPhone("967773171477")).toBe("967773171477");
    expect(normalizeWhatsAppRecipientPhone("0773171477")).toBe("967773171477");
  });

  it("omits static header and footer components from the Meta template payload", () => {
    expect(
      buildMetaTemplateComponents(
        {
          headerText: "يرجى الإدخال",
          footerText: "#نرعاكم_كأهالينا",
          variables: ["name", "announcement_text"],
          buttons: [{ type: "URL", url: "https://sghsanaa.manus.space/{{1}}" }],
        },
        {
          name: "Ahmed",
          announcement_text: "نرحب بقدوم د. صخر الفقية.",
          button_0: "https://sghsanaa.manus.space/doctors/Dr-Sakhr-Al-Faqih",
        }
      )
    ).toEqual([
      {
        type: "body",
        parameters: [
          { type: "text", parameter_name: "name", text: "Ahmed" },
          { type: "text", parameter_name: "announcement_text", text: "نرحب بقدوم د. صخر الفقية." },
        ],
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: "doctors/Dr-Sakhr-Al-Faqih" }],
      },
    ]);
  });

  it("includes the approved image media when the Meta template has an image header", () => {
    expect(
      buildMetaTemplateComponents(
        {
          headerFormat: "IMAGE",
          headerMediaUrl: "https://cdn.example.com/template-header.jpg",
          variables: ["name"],
        },
        { name: "Ahmed" }
      )
    ).toEqual([
      {
        type: "header",
        parameters: [{ type: "image", image: { link: "https://cdn.example.com/template-header.jpg" } }],
      },
      {
        type: "body",
        parameters: [{ type: "text", parameter_name: "name", text: "Ahmed" }],
      },
    ]);
  });

  it("uses the explicitly inserted image URL for an image header", () => {
    expect(
      buildMetaTemplateComponents(
        {
          headerFormat: "IMAGE",
          headerMediaUrl: "https://storage.example.com/broadcast-headers/doctor.jpg",
          variables: ["name"],
        },
        { name: "Ahmed" }
      )[0]
    ).toEqual({
      type: "header",
      parameters: [{ type: "image", image: { link: "https://storage.example.com/broadcast-headers/doctor.jpg" } }],
    });
  });

  it("places the manually inserted header image URL in the final Meta message payload", () => {
    const payload = buildMetaTemplateMessagePayload(
      "967773171477",
      {
        metaName: "general_announcement_offer",
        languageCode: "ar",
        headerFormat: "IMAGE",
        variables: ["name", "announcement_text"],
        buttons: [{ type: "URL", url: "https://sghsanaa.manus.space/{{1}}" }],
      },
      {
        name: "Recipient",
        announcement_text: "نرحب بقدوم د. صخر الفقية.",
        button_0: "https://sghsanaa.manus.space/doctors/Dr-Sakhr-Al-Faqih",
      },
      "https://cdn.example.com/broadcast-headers/sakhr.jpg"
    );

    expect(payload.to).toBe("967773171477");
    expect(payload.template.name).toBe("general_announcement_offer");
    expect(payload.template.components[0]).toEqual({
      type: "header",
      parameters: [{ type: "image", image: { link: "https://cdn.example.com/broadcast-headers/sakhr.jpg" } }],
    });
  });

  it("accepts a public HTTPS URL that resolves to a supported image", async () => {
    const requestSpy = vi.spyOn(axios, "get").mockResolvedValue({
      headers: { "content-type": "image/jpeg" },
      data: { destroy: vi.fn() },
    } as any);

    await expect(validatePublicHeaderImageUrl("https://cdn.example.com/doctor.jpg")).resolves.toBe(
      "https://cdn.example.com/doctor.jpg"
    );
    expect(requestSpy).toHaveBeenCalledWith(
      "https://cdn.example.com/doctor.jpg",
      expect.objectContaining({ responseType: "stream" })
    );
    requestSpy.mockRestore();
  });

  it("rejects local or non-HTTPS image URLs before trying to load them", async () => {
    await expect(validatePublicHeaderImageUrl("http://localhost/header.jpg")).rejects.toThrow(
      "public HTTPS"
    );
  });
});
