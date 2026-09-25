import crypto from 'crypto';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

export function extractWhatsAppFlowStatus(value: unknown) {
  const data = isRecord(value) ? value : {};
  const errorValue = data.error ?? (Array.isArray(data.errors) ? data.errors[0] : undefined);
  const error = isRecord(errorValue) ? errorValue : undefined;
  const metrics = isRecord(data.metrics) ? data.metrics : {};
  const latency = data.latency_ms ?? data.latency ?? metrics.latency_ms;

  return {
    flowId: toNullableString(data.flow_id ?? (isRecord(data.flow) ? data.flow.id : undefined)),
    eventName: String(data.event ?? data.event_type ?? 'FLOW_STATUS_CHANGE'),
    status: toNullableString(data.flow_status ?? data.status),
    availability: toNullableString(data.availability ?? data.availability_status),
    latencyMs: Number.isFinite(Number(latency)) ? Number(latency) : null,
    errorCode: toNullableString(error?.code),
    errorMessage: error?.message ? String(error.message).slice(0, 1000) : null,
  };
}

/**
 * يستخرج معلومات تشغيلية من nfm_reply من دون حفظ قيم النموذج التي قد تكون حساسة،
 * بل يحتفظ فقط بمفاتيح الحقول وبصمة التوكن.
 */
export function extractWhatsAppFlowReply(interactive: unknown, contextMessageId?: string | null) {
  const interactiveData = isRecord(interactive) ? interactive : {};
  const reply = isRecord(interactiveData.nfm_reply) ? interactiveData.nfm_reply : undefined;
  if (interactiveData.type !== 'nfm_reply' || !reply) {
    return null;
  }
  let responseKeys: string[] = [];
  let responseValid = false;
  if (typeof reply.response_json === 'string') {
    try {
      const response = JSON.parse(reply.response_json);
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        responseKeys = Object.keys(response).sort();
        responseValid = true;
      }
    } catch {
      responseValid = false;
    }
  }
  return {
    eventName: 'NFM_REPLY',
    contextMessageId: contextMessageId ?? null,
    responseKeys,
    responseValid,
    flowTokenHash:
      typeof reply.flow_token === 'string' && reply.flow_token
        ? crypto.createHash('sha256').update(reply.flow_token).digest('hex')
        : null,
  };
}
