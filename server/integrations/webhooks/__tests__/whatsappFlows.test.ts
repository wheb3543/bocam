import { describe, expect, it } from 'vitest';
import { extractWhatsAppFlowReply, extractWhatsAppFlowStatus } from '../whatsappFlows';

describe('WhatsApp Flow webhook handling', () => {
  it('يستخرج حالة Flow ومؤشرات الإتاحة والكمون والخطأ من FLOW_STATUS_CHANGE', () => {
    expect(
      extractWhatsAppFlowStatus({
        event: 'FLOW_STATUS_CHANGE',
        flow_id: 'flow-123',
        flow_status: 'PUBLISHED',
        availability: 'AVAILABLE',
        latency_ms: 87,
        error: { code: 100, message: 'example' },
      })
    ).toEqual({
      flowId: 'flow-123',
      eventName: 'FLOW_STATUS_CHANGE',
      status: 'PUBLISHED',
      availability: 'AVAILABLE',
      latencyMs: 87,
      errorCode: '100',
      errorMessage: 'example',
    });
  });

  it('يحفظ مفاتيح nfm_reply وبصمة flow token فقط ولا يعيد قيم النموذج الحساسة', () => {
    const reply = extractWhatsAppFlowReply(
      {
        type: 'nfm_reply',
        nfm_reply: {
          response_json: JSON.stringify({ patient_name: 'مريض', medical_record: 'sensitive' }),
          flow_token: 'confidential-token',
        },
      },
      'wamid.context'
    );
    expect(reply).toMatchObject({
      eventName: 'NFM_REPLY',
      contextMessageId: 'wamid.context',
      responseKeys: ['medical_record', 'patient_name'],
      responseValid: true,
    });
    expect(JSON.stringify(reply)).not.toContain('مريض');
    expect(JSON.stringify(reply)).not.toContain('confidential-token');
  });
});
