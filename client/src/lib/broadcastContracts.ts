export type BroadcastSourceKey =
  `doctor_${number}` | `camp_${number}` | `offer_${number}` | 'all_leads';

export interface RecipientRecord {
  phone: string;
  fullName: string;
  source: string;
  sourceId?: number;
}

export interface TemplateRecord {
  id: number;
  variables?: string[] | null;
  buttons?: Array<{ type?: string; url?: string; example?: string[] }> | null;
}

export function buildRecipientQueryInput(selectedSources: string[]) {
  return {
    doctorIds: selectedSources
      .filter((source) => source.startsWith('doctor_'))
      .map((source) => Number(source.slice('doctor_'.length)))
      .filter((id) => Number.isInteger(id) && id > 0),
    campIds: selectedSources
      .filter((source) => source.startsWith('camp_'))
      .map((source) => Number(source.slice('camp_'.length)))
      .filter((id) => Number.isInteger(id) && id > 0),
    offerIds: selectedSources
      .filter((source) => source.startsWith('offer_'))
      .map((source) => Number(source.slice('offer_'.length)))
      .filter((id) => Number.isInteger(id) && id > 0),
    includeAllLeads: selectedSources.includes('all_leads'),
  };
}

export function initializeTemplateVariables(template: TemplateRecord) {
  const variables: Record<string, string> = {};
  for (const variable of template.variables ?? []) {
    if (variable !== 'name') {
      variables[variable] = '';
    }
  }
  (template.buttons ?? []).forEach((button, index) => {
    if (button.type === 'URL' && /\{\{\d+\}\}/.test(button.url ?? '')) {
      variables[`button_${index}`] = '';
    }
  });
  return variables;
}

export function buildSendRecipients(recipients: RecipientRecord[]) {
  return recipients.map(({ phone, fullName, source }) => ({ phone, fullName, source }));
}

export type BroadcastContentSourceKind = 'doctor' | 'camp' | 'offer';

export interface BroadcastContentSource {
  kind: BroadcastContentSourceKind;
  id: number;
  title: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  specialty?: string | null;
}

export interface BroadcastContentSuggestion {
  announcementText: string;
  pageUrl: string;
  imageUrl?: string;
}

const PUBLIC_SITE_URL = 'https://sghsanaa.net';

export function buildBroadcastContentSuggestion(
  source: BroadcastContentSource
): BroadcastContentSuggestion {
  const routeSegment =
    source.kind === 'doctor' ? 'doctors' : source.kind === 'camp' ? 'camps' : 'offers';
  const path = source.slug || String(source.id);
  const description = source.description?.trim();
  const imageUrl = source.imageUrl?.trim() || undefined;

  if (source.kind === 'doctor') {
    const specialty = source.specialty?.trim();
    return {
      announcementText: `نرحب بقدوم ${source.title}${specialty ? `، ${specialty}` : ''}. احجزوا موعدكم الآن للاستفادة من خدماته الطبية.`,
      pageUrl: `${PUBLIC_SITE_URL}/${routeSegment}/${path}`,
      imageUrl,
    };
  }

  if (source.kind === 'camp') {
    return {
      announcementText: `يسر المستشفى السعودي الألماني بصنعاء دعوتكم للتسجيل في ${source.title}.${description ? ` ${description}` : ''}`,
      pageUrl: `${PUBLIC_SITE_URL}/${routeSegment}/${path}`,
      imageUrl,
    };
  }

  return {
    announcementText: `استفيدوا من ${source.title} لدى المستشفى السعودي الألماني بصنعاء.${description ? ` ${description}` : ''}`,
    pageUrl: `${PUBLIC_SITE_URL}/${routeSegment}/${path}`,
    imageUrl,
  };
}

export function applyContentSuggestionToVariables(
  variables: Record<string, string>,
  suggestion: BroadcastContentSuggestion
) {
  const next = { ...variables };
  if ('announcement_text' in next) {
    next.announcement_text = suggestion.announcementText;
  }
  for (const key of Object.keys(next)) {
    if (key.startsWith('button_')) {
      next[key] = suggestion.pageUrl;
    }
  }
  return next;
}

export const CONTACT_SOURCE_KEYS = [
  'appointments',
  'camp_registrations',
  'offer_leads',
  'leads',
] as const;

export type ContactSource = (typeof CONTACT_SOURCE_KEYS)[number];

export function buildContactListInput(
  search: string,
  recipientSources: readonly ContactSource[] = CONTACT_SOURCE_KEYS,
  statuses: readonly string[] = []
) {
  return {
    page: 1,
    limit: 100,
    search: search.trim() || undefined,
    recipientSources: [...recipientSources],
    statuses: statuses.length > 0 ? [...statuses] : undefined,
  };
}

export function buildContactExportInput(
  exportType: 'vcf' | 'csv',
  recipientSources: readonly ContactSource[] = CONTACT_SOURCE_KEYS,
  statuses: readonly string[] = []
) {
  return {
    exportType,
    filterCriteria: {
      recipientSources: [...recipientSources],
      statuses: statuses.length > 0 ? [...statuses] : undefined,
    },
  };
}

export function buildGoogleSyncInput(
  accessToken: string,
  recipientSources: readonly ContactSource[] = CONTACT_SOURCE_KEYS,
  statuses: readonly string[] = []
) {
  return {
    accessToken: accessToken.trim(),
    filterCriteria: {
      recipientSources: [...recipientSources],
      statuses: statuses.length > 0 ? [...statuses] : undefined,
    },
  };
}
