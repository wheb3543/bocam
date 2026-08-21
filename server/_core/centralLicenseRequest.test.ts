import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCentralLicenseConfiguration } from './centralLicenseRequest';

describe('central license request configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires both Idea Hub URL and a positive system identifier', () => {
    vi.stubEnv('IDEA_HUB_URL', 'https://idea-hub.example.test/');
    vi.stubEnv('IDEA_HUB_SYSTEM_ID', '1');

    expect(getCentralLicenseConfiguration()).toEqual({
      configured: true,
      baseUrl: 'https://idea-hub.example.test',
      systemId: 1,
    });

    vi.stubEnv('IDEA_HUB_SYSTEM_ID', '0');
    expect(getCentralLicenseConfiguration().configured).toBe(false);
  });
});
