import { describe, expect, it } from 'vitest';
import {
  ADMIN_NAVIGATION_ITEMS,
  ADMIN_NAVIGATION_SECTIONS,
  TASK_DEPARTMENTS,
} from './adminNavigation';

describe('canonical admin navigation', () => {
  it('places every canonical item exactly once in the hierarchy', () => {
    const hierarchicalItems = ADMIN_NAVIGATION_SECTIONS.flatMap((section) => [
      ...section.items,
      ...section.subsections.flatMap((subsection) => subsection.items),
    ]);
    const itemIds = hierarchicalItems.map((item) => item.id);

    expect(new Set(itemIds).size).toBe(itemIds.length);
    expect(new Set(itemIds)).toEqual(new Set(ADMIN_NAVIGATION_ITEMS.map((item) => item.id)));
  });

  it('defines the hospital task departments as organizational data', () => {
    expect(TASK_DEPARTMENTS.map((department) => department.id)).toEqual([
      'legal',
      'finance',
      'human-resources',
      'nursing',
      'housekeeping',
      'training',
      'procurement',
    ]);
  });
});
