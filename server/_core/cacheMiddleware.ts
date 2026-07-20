/**
 * Caching Middleware
 * Middleware لإدارة التخزين المؤقت HTTP
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * إضافة Cache-Control headers للردود
 *
 * @param maxAge - مدة التخزين المؤقت بالثواني
 * @param options - خيارات إضافية
 * @returns Express middleware
 */
export function cacheControl(
  maxAge: number,
  options: {
    public?: boolean;
    private?: boolean;
    mustRevalidate?: boolean;
    noTransform?: boolean;
    proxyRevalidate?: number;
    staleWhileRevalidate?: number;
    staleIfError?: number;
    immutable?: boolean;
    noStore?: boolean;
    noCache?: boolean;
  } = {}
) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const directives: string[] = [];

    if (options.public) {
      directives.push('public');
    }
    if (options.private) {
      directives.push('private');
    }
    if (options.mustRevalidate) {
      directives.push('must-revalidate');
    }
    if (options.noTransform) {
      directives.push('no-transform');
    }
    if (options.proxyRevalidate) {
      directives.push(`proxy-revalidate=${options.proxyRevalidate}`);
    }
    if (options.staleWhileRevalidate) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }
    if (options.staleIfError) {
      directives.push(`stale-if-error=${options.staleIfError}`);
    }
    if (options.immutable) {
      directives.push('immutable');
    }
    if (options.noStore) {
      directives.push('no-store');
    }
    if (options.noCache) {
      directives.push('no-cache');
    }

    directives.push(`max-age=${maxAge}`);

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
}

/**
 * إضافة ETag header للردود
 *
 * @param etag - قيمة ETag
 * @returns Express middleware
 */
export function etag(etagValue: string) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('ETag', etagValue);
    next();
  };
}

/**
 * إضافة Last-Modified header للردود
 *
 * @param date - تاريخ التعديل الأخير
 * @returns Express middleware
 */
export function lastModified(date: Date) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Last-Modified', date.toUTCString());
    next();
  };
}

/**
 * Middleware للتحقق من ETag (If-None-Match)
 *
 * إذا كان ETag في الطلب يطابق ETag الحالي، يرجع 304 Not Modified
 */
export function checkEtag(etagValue: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ifNoneMatch = req.get('If-None-Match');

    if (ifNoneMatch === etagValue) {
      res.status(304).end();
      return;
    }

    res.setHeader('ETag', etagValue);
    next();
  };
}

/**
 * Middleware للتحقق من Last-Modified (If-Modified-Since)
 *
 * إذا كان التاريخ في الطلب يطابق أو أحدث من التاريخ الحالي، يرجع 304 Not Modified
 */
export function checkLastModified(lastModifiedDate: Date) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ifModifiedSince = req.get('If-Modified-Since');

    if (ifModifiedSince) {
      const modifiedSince = new Date(ifModifiedSince);
      if (modifiedSince >= lastModifiedDate) {
        res.status(304).end();
        return;
      }
    }

    res.setHeader('Last-Modified', lastModifiedDate.toUTCString());
    next();
  };
}

/**
 * إعدادات التخزين المؤقت لأنواع مختلفة من المحتوى
 */
export const cacheStrategies = {
  // محتوى ثابت لا يتغير (CSS, JS, الصور)
  static: cacheControl(31536000, { public: true, immutable: true }), // 1 year

  // محتوى يتغير نادراً (HTML, fonts)
  infrequent: cacheControl(86400, { public: true, mustRevalidate: true }), // 1 day

  // محتوى يتغير بشكل متوسط (API responses)
  medium: cacheControl(3600, { public: true, mustRevalidate: true }), // 1 hour

  // محتوى يتغير بشكل متكرر (Real-time data)
  frequent: cacheControl(300, { public: true, mustRevalidate: true }), // 5 minutes

  // محتوى خاص بالمستخدم
  private: cacheControl(600, { private: true, mustRevalidate: true }), // 10 minutes

  // محتوى لا يجب تخزينه مؤقتاً
  noCache: cacheControl(0, { noStore: true, noCache: true, mustRevalidate: true }),
};

/**
 * Middleware لتعطيل التخزين المؤقت
 */
export function noCache(_req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}
