import { TRPCClientError } from '@trpc/client';

export function getPublicationQualityIssues(error: unknown): string[] {
  if (!(error instanceof TRPCClientError) || error.data?.code !== 'PRECONDITION_FAILED') {
    return [];
  }

  return error.message
    .replace(/^فشل فحص جودة النشر:\s*/, '')
    .split('\n')
    .map((issue) => issue.replace(/^[•\-\s]+/, '').trim())
    .filter(Boolean);
}
