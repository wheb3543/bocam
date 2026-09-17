import { Users, User } from 'lucide-react';
import { trpc } from '@/lib/api/trpc';

export const RELATIONSHIP_LABELS: Record<string, string> = {
  self: 'أنا',
  father: 'أب',
  mother: 'أم',
  son: 'ابن',
  daughter: 'ابنة',
  husband: 'زوج',
  wife: 'زوجة',
  brother: 'أخ',
  sister: 'أخت',
  grandfather: 'جد',
  grandmother: 'جدة',
  other: 'آخر',
};

export type ValidRelationship =
  | 'self'
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'husband'
  | 'wife'
  | 'brother'
  | 'sister'
  | 'grandfather'
  | 'grandmother'
  | 'other';

export const RELATIONSHIP_OPTIONS: { value: ValidRelationship; label: string }[] = [
  { value: 'son', label: 'ابن' },
  { value: 'daughter', label: 'ابنة' },
  { value: 'wife', label: 'زوجة' },
  { value: 'husband', label: 'زوج' },
  { value: 'father', label: 'أب' },
  { value: 'mother', label: 'أم' },
  { value: 'brother', label: 'أخ' },
  { value: 'sister', label: 'أخت' },
  { value: 'grandfather', label: 'جد' },
  { value: 'grandmother', label: 'جدة' },
  { value: 'other', label: 'أخرى / تابع' },
];

/**
 * Filter relationships based on:
 * 1. Primary account owner's gender (Requirement 2):
 *    - Male account owner cannot have a husband.
 *    - Female account owner cannot have a wife.
 * 2. Family member's gender (Requirement 3):
 *    - Male member can only have male relationships (+ other).
 *    - Female member can only have female relationships (+ other).
 */
export function getAvailableRelationships(
  primaryGender?: 'male' | 'female' | null,
  memberGender?: 'male' | 'female' | null
): { value: ValidRelationship; label: string }[] {
  if (memberGender === 'male') {
    const list: { value: ValidRelationship; label: string }[] = [
      { value: 'son', label: 'ابن' },
      { value: 'father', label: 'أب' },
      { value: 'brother', label: 'أخ' },
      { value: 'grandfather', label: 'جد' },
    ];
    // Male member can be husband ONLY if primary account owner is female
    if (primaryGender === 'female') {
      list.push({ value: 'husband', label: 'زوج' });
    }
    list.push({ value: 'other', label: 'أخرى / تابع' });
    return list;
  }

  if (memberGender === 'female') {
    const list: { value: ValidRelationship; label: string }[] = [
      { value: 'daughter', label: 'ابنة' },
      { value: 'mother', label: 'أم' },
      { value: 'sister', label: 'أخت' },
      { value: 'grandmother', label: 'جدة' },
    ];
    // Female member can be wife ONLY if primary account owner is male
    if (primaryGender === 'male') {
      list.push({ value: 'wife', label: 'زوجة' });
    }
    list.push({ value: 'other', label: 'أخرى / تابع' });
    return list;
  }

  return RELATIONSHIP_OPTIONS.filter((opt) => {
    if (primaryGender === 'male' && opt.value === 'husband') {
      return false;
    }
    if (primaryGender === 'female' && opt.value === 'wife') {
      return false;
    }
    return true;
  });
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  self: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  son: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  daughter:
    'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800',
  wife: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  husband:
    'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  father:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  mother:
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  brother:
    'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  sister:
    'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800',
  grandfather:
    'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  grandmother:
    'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
  other:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

export function getRelationshipBadgeStyle(relationship?: string): string {
  return (
    RELATIONSHIP_COLORS[relationship || 'other'] ||
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
  );
}

interface FamilyMembersFilterProps {
  selectedMemberId: number | 'all';
  onSelectMember: (id: number | 'all') => void;
  counts?: Record<number | 'all', number>;
  className?: string;
}

export default function FamilyMembersFilter({
  selectedMemberId,
  onSelectMember,
  counts,
  className = '',
}: FamilyMembersFilterProps) {
  const { data: familyMembers } = trpc.patientPortal.getFamilyMembers.useQuery();

  if (!familyMembers || familyMembers.length <= 1) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-100 bg-white/90 p-3 shadow-xs dark:border-emerald-900/30 dark:bg-background/50 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Users className="h-4 w-4 text-emerald-600" />
          <span>تصفية حسب فرد الأسرة</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          {familyMembers.length} أفراد في حسابك
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* زر الكل */}
        <button
          type="button"
          onClick={() => onSelectMember('all')}
          className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border flex items-center gap-1.5 ${
            selectedMemberId === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-background text-foreground border-border hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20'
          }`}
        >
          <span>الكل</span>
          {counts && counts['all'] !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedMemberId === 'all'
                  ? 'bg-white/25 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {counts['all']}
            </span>
          )}
        </button>

        {/* أفراد العائلة */}
        {familyMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const relLabel = RELATIONSHIP_LABELS[member.relationship] || member.relationship;
          const memberCount = counts ? counts[member.id] : undefined;

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelectMember(member.id)}
              className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-background text-foreground border-border hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20'
              }`}
            >
              <User className="h-3 w-3 opacity-70" />
              <span>{member.fullName}</span>
              <span
                className={`rounded-md border px-1.5 py-0.2 text-[10px] font-normal ${
                  isSelected
                    ? 'bg-white/25 text-white border-white/30'
                    : getRelationshipBadgeStyle(member.relationship)
                }`}
              >
                {relLabel}
              </span>
              {memberCount !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {memberCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
