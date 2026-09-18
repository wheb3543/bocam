export type OperationalCostRow = {
  id?: number | string;
  phoneNumber?: string;
  conversationCost?: number | string | null;
  pricingModel?: string | null;
  pricingCategory?: string | null;
  billable?: boolean | null;
  createdAt?: Date | string | null;
};

export type OperationalCostSummary = {
  conversations: OperationalCostRow[];
  totalCost: number;
  averageCost: number;
  conversationCount: number;
  billableCount: number;
  highCostCount: number;
  highCostTotal: number;
  highCostConversations: OperationalCostRow[];
  costDataAvailable: boolean;
};

export const HIGH_COST_CONVERSATION_THRESHOLD = 1;

export function createOperationalCostSummary(
  rows: OperationalCostRow[] | undefined | null
): OperationalCostSummary {
  const conversations = rows ?? [];
  const costRows = conversations.filter(
    (item) => item.conversationCost !== null && item.conversationCost !== undefined
  );
  const totalCost = costRows.reduce((total, item) => total + Number(item.conversationCost || 0), 0);
  const highCostConversations = costRows.filter(
    (item) => Number(item.conversationCost || 0) > HIGH_COST_CONVERSATION_THRESHOLD
  );

  return {
    conversations,
    totalCost,
    averageCost: costRows.length ? totalCost / costRows.length : 0,
    conversationCount: conversations.length,
    billableCount: conversations.filter((item) => Boolean(item.billable)).length,
    highCostCount: highCostConversations.length,
    highCostTotal: highCostConversations.reduce(
      (total, item) => total + Number(item.conversationCost || 0),
      0
    ),
    highCostConversations,
    costDataAvailable: costRows.length > 0,
  };
}
