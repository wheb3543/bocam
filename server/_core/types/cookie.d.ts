declare module 'cookie' {
  export function parseCookie(
    str: string,
    options?: Record<string, unknown>
  ): Record<string, string | undefined>;
  export function stringifyCookie(
    cookie: Record<string, string | undefined>,
    options?: Record<string, unknown>
  ): string;
  export function parse(str: string, options?: Record<string, unknown>): Record<string, string>;
}
