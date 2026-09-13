import crypto from 'crypto';

export function extractWhatsAppFlowStatus(value: Record<string, any>) {
  const error = value.error ?? value.errors?.[0];
  const latency = value.latency_ms ?? value.latency ?? value.metrics?.latency_ms;
  return {
    flowId: value.flow_id ?? value.flow?.id ?? null,
    eventName: String(value.event ?? value.event_type ?? 'FLOW_STATUS_CHANGE'),
    status: value.flow_status ?? value.status ?? null,
    availability: value.availability ?? value.availability_status ?? null,
    latencyMs: Number.isFinite(Number(latency)) ? Number(latency) : null,
    errorCode: error?.code ? String(error.code) : null,
    errorMessage: error?.message ? String(error.message).slice(0, 1000) : null,
  };
}

/**
 * يستخرج معلومات تشغيلية من nfm_reply من دون حفظ قيم النموذج التي قد تكون حساسة،
 * بل يحتفظ فقط بمفاتيح الحقول وبصمة التوكن.
 */
export function extractWhatsAppFlowReply(
  interactive: Record<string, any>,
  contextMessageId?: string | null
) {
  const reply = interactive.nfm_reply;
  if (interactive.type !== 'nfm_reply' || !reply) {
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
