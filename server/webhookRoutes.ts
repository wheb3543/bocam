import { Router, Request, Response } from "express";
import { publish } from "./_core/pubsub";
import { processWebhookEvent, verifyWebhookSignature, verifyWebhookToken } from "./webhooks/whatsappWebhook";
import { ENV } from "./_core/env";
import multer from "multer";

/**
 * WhatsApp Webhook Express Routes
 * Meta requires standard HTTP GET/POST endpoints (not tRPC)
 * GET  /api/webhooks/whatsapp → Verification
 * POST /api/webhooks/whatsapp → Receive messages & statuses
 */

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "sgh_crm_webhook_2024";

// Global channel for all users to receive new message notifications
const GLOBAL_CHANNEL = "global:whatsapp";

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});


export function createWebhookRouter(): Router {
  const router = Router();

  /**
   * GET /api/webhooks/whatsapp
   * Meta verification endpoint - returns hub.challenge on success
   */
  router.get("/api/webhooks/whatsapp", (req: Request, res: Response) => {
    verifyWebhookToken(req, res);
  });

  /**
   * GET /api/whatsapp/media/:mediaId
   * Proxy endpoint to download media from WhatsApp Media API
   */
  router.get("/api/whatsapp/media/:mediaId", async (req: Request, res: Response) => {
    try {
      const { mediaId } = req.params;
      const accessToken = ENV.metaAccessToken;

      if (!accessToken) {
        res.status(500).json({ error: "metaAccessToken not configured" });
        return;
      }

      const mediaResponse = await fetch(`https://graph.facebook.com/v25.0/${mediaId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!mediaResponse.ok) {
        res.status(404).json({ error: "Media not found" });
        return;
      }

      const mediaData = await mediaResponse.json();
      const mediaUrl = mediaData.url;

      // Download the actual media file
      const fileResponse = await fetch(mediaUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!fileResponse.ok) {
        res.status(404).json({ error: "Failed to download media" });
        return;
      }

      // Set appropriate headers
      const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Stream the file
      const buffer = await fileResponse.arrayBuffer();
      res.send(Buffer.from(buffer));

    } catch (error) {
      console.error("[WhatsApp Media Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * POST /api/whatsapp/upload
   * Upload media file and return base64 data URL
   */
  router.post("/api/whatsapp/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const file = req.file;
      const mimeType = file.mimetype;
      const base64 = file.buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      res.json({
        success: true,
        dataUrl,
        mimeType,
        filename: file.originalname,
        size: file.size,
      });
    } catch (error) {
      console.error("[WhatsApp Upload] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * POST /api/webhooks/whatsapp
   * Receives incoming messages, button responses, and message statuses
   */
  router.post("/api/webhooks/whatsapp", async (req: Request, res: Response) => {
    try {
      // ✅ التحقق من التوقيع قبل معالجة أي حدث
      if (!verifyWebhookSignature(req)) {
        console.error("[WhatsApp Webhook] ❌ Invalid signature — request rejected");
        res.status(403).json({ error: "Invalid signature" });
        return;
      }

      // Always respond 200 immediately to Meta (they retry on non-200)
      res.status(200).json({ success: true });

      const body = req.body;
      if (!body) {
        console.error("[Webhook] Empty payload received");
        return;
      }

      if (body.object !== "whatsapp_business_account") {
        console.log("[Webhook] Ignoring non-WhatsApp webhook");
        return;
      }

      console.log("[Webhook] Received:", JSON.stringify(body, null, 2));

      // تسجيل الحدث في قاعدة البيانات للتحليل
      try {
        const { createWhatsAppWebhookEvent } = await import('./db');
        const { entry } = body;
        if (entry && Array.isArray(entry)) {
          for (const item of entry) {
            const { changes } = item;
            if (changes && Array.isArray(changes)) {
              for (const change of changes) {
                const { field, value } = change;
                if (value) {
                  // استخراج رقم الهاتف من الرسائل إذا وجد
                  let phoneNumber = null;
                  if (field === 'messages' && value.messages && value.messages.length > 0) {
                    phoneNumber = value.messages[0].from || null;
                  }

                  console.log(`[Webhook Logger] Logging event: ${field}, phone: ${phoneNumber}`);
                  const result = await createWhatsAppWebhookEvent({
                    eventType: field,
                    subType: value.statuses ? 'status' : (value.messages ? 'message' : undefined),
                    phoneNumber,
                    rawPayload: JSON.stringify(value),
                  });
                  console.log(`[Webhook Logger] Event logged successfully:`, result);

                  // 🔔 Publish SSE event to global channel for webhook events
                  try {
                    publish(GLOBAL_CHANNEL, "webhook_event", {
                      eventType: field,
                      subType: value.statuses ? 'status' : (value.messages ? 'message' : undefined),
                      phoneNumber,
                      rawPayload: JSON.stringify(value),
                      handlerExists: true,
                      processed: true,
                      timestamp: new Date().toISOString(),
                    });
                  } catch (error) {
                    console.error("[Webhook] Error publishing webhook event SSE:", error);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("[Webhook] Error logging webhook event:", error);
      }

      // معالجة الحدث باستخدام المعالج المتقدم من whatsappWebhook.ts
      await processWebhookEvent(body);

    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      // Don't throw - we already sent 200 to Meta
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error("[Webhook] Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
    }
  });

  return router;
}
