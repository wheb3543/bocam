export type ApprovalEntityType =
  'textContent' | 'image' | 'media' | 'page' | 'section' | 'sectionButton' | 'seo';

export function buildApprovalRequestInput(
  entityType: ApprovalEntityType,
  entityId: number,
  changes: object,
  reviewerValue: string
) {
  const { qualityOverrideReason: _qualityOverrideReason, ...approvalChanges } = changes as Record<
    string,
    unknown
  >;

  return {
    entityType,
    entityId,
    changes: JSON.stringify({ changes: approvalChanges }),
    assignedReviewerId: reviewerValue === 'unassigned' ? undefined : Number(reviewerValue),
  };
}
