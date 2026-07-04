/* global AbortSignal */
declare global {
  interface AbortSignalConstructor {
    timeout(milliseconds: number): AbortSignal;
  }

  type AbortSignalWithTimeout = AbortSignalConstructor;

  var AbortSignal: AbortSignalConstructor;
}

export {};
