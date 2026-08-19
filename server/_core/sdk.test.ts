import { describe, expect, it } from 'vitest';
import { sdk } from './sdk';

describe('SDK cookie parsing', () => {
  it('parses the session cookie used by scheduled Heartbeat callbacks', () => {
    const parseCookies = (sdk as unknown as {
      parseCookies: (value: string | undefined) => Map<string, string>;
    }).parseCookies.bind(sdk);

    expect(parseCookies('app_session_id=cron-session-token; theme=light')).toEqual(
      new Map([
        ['app_session_id', 'cron-session-token'],
        ['theme', 'light'],
      ])
    );
  });
});
