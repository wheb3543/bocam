/**
 * Unit tests for campRegistrationHelpers
 * اختبارات الوحدة لدوال مساعدة تسجيلات المخيمات
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStatusTimestamps } from '../campRegistrationHelpers';

describe('createStatusTimestamps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create contactedAt timestamp for contacted status', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);

    const result = createStatusTimestamps('contacted');

    expect(result).toHaveProperty('contactedAt');
    expect(result.contactedAt).toEqual(now);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should create confirmedAt timestamp for confirmed status', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);

    const result = createStatusTimestamps('confirmed');

    expect(result).toHaveProperty('confirmedAt');
    expect(result.confirmedAt).toEqual(now);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should create attendedAt timestamp for attended status', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);

    const result = createStatusTimestamps('attended');

    expect(result).toHaveProperty('attendedAt');
    expect(result.attendedAt).toEqual(now);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should create completedAt timestamp for completed status', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);

    const result = createStatusTimestamps('completed');

    expect(result).toHaveProperty('completedAt');
    expect(result.completedAt).toEqual(now);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should create cancelledAt timestamp for cancelled status', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);

    const result = createStatusTimestamps('cancelled');

    expect(result).toHaveProperty('cancelledAt');
    expect(result.cancelledAt).toEqual(now);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should return empty object for unknown status', () => {
    const result = createStatusTimestamps('unknown');

    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});
