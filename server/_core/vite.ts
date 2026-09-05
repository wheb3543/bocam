import express, { type Express } from 'express';
import fs from 'fs';
import { type Server } from 'http';
import { nanoid } from 'nanoid';
import path from 'path';
// Dynamic import of vite in development only
import { createLogger } from './logger';

const logger = createLogger('vite');

export async function setupVite(app: Express, server: Server) {
  app.use(
    '/tenant-assets',
    express.static(path.join(process.env.TENANT_ROOT || process.cwd(), 'branding', 'assets'))
  );
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    // استخدم إعداد المشروع الفعلي؛ فهو يحدد client كجذر ويعرّف مسارات alias.
    // تعطيل configFile يجعل /src/main.tsx يُفسَّر من جذر الخادم ويعيد HTML fallback.
    configFile: path.resolve(import.meta.dirname, '../..', 'vite.config.ts'),
    server: serverOptions,
    appType: 'custom',
  });

  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Use admin HTML template for /admin/* routes
      // This ensures manifest-admin.json is loaded directly in <head> without JS
      // which is required for correct PWA scope isolation
      const isAdminRoute = url.startsWith('/admin') || url.startsWith('/admin');
      const templateFile = isAdminRoute ? 'index-admin.html' : 'index.html';

      const clientTemplate = path.resolve(import.meta.dirname, '../..', 'client', templateFile);

      // Fallback to index.html if index-admin.html doesn't exist
      const templatePath = fs.existsSync(clientTemplate)
        ? clientTemplate
        : path.resolve(import.meta.dirname, '../..', 'client', 'index.html');

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(templatePath, 'utf-8');
      const tenantSnapshot = {
        tenantId: process.env.TENANT_ID || '',
        companyName:
          process.env.VITE_COMPANY_NAME ||
          process.env.VITE_COMPANY_ENGLISH_NAME ||
          process.env.VITE_COMPANY_ARABIC_NAME ||
          '',
        companyArabicName: process.env.VITE_COMPANY_ARABIC_NAME || '',
        companyEnglishName: process.env.VITE_COMPANY_ENGLISH_NAME || '',
        companyLogo: process.env.VITE_COMPANY_LOGO || '',
        companyPhone: process.env.VITE_COMPANY_PHONE || '',
        companyEmail: process.env.VITE_COMPANY_EMAIL || '',
        companyAddress: process.env.VITE_COMPANY_ADDRESS || '',
        companyCity: process.env.COMPANY_CITY || '',
        companySlogan: process.env.VITE_COMPANY_SLOGAN || process.env.VITE_COMPANY_SLOGAN_EN || '',
        companySloganEn: process.env.VITE_COMPANY_SLOGAN_EN || '',
        theme: {
          primary: process.env.TENANT_THEME_PRIMARY || '',
          secondary: process.env.TENANT_THEME_SECONDARY || '',
          accent: process.env.TENANT_THEME_ACCENT || '',
          background: process.env.TENANT_THEME_BACKGROUND || '',
          text: process.env.TENANT_THEME_TEXT || '',
          success: process.env.TENANT_THEME_SUCCESS || '',
          danger: process.env.TENANT_THEME_DANGER || '',
          warning: process.env.TENANT_THEME_WARNING || '',
        },
        facebookUrl: process.env.VITE_FACEBOOK_URL || '',
        instagramUrl: process.env.VITE_INSTAGRAM_URL || '',
        twitterUrl: process.env.VITE_TWITTER_URL || '',
        linkedinUrl: process.env.VITE_LINKEDIN_URL || '',
      };

      const tenantScript = `
        <script>
          window.__BOCAM_TENANT__ = Object.assign({}, window.__BOCAM_TENANT__ || {}, ${JSON.stringify(
            tenantSnapshot
          )});
          var tenantTheme = window.__BOCAM_TENANT__.theme || {};
          Object.keys(tenantTheme).forEach(function (key) {
            if (tenantTheme[key]) {
              document.documentElement.style.setProperty('--tenant-' + key, tenantTheme[key]);
            }
          });
        </script>
      `;

      template = template.replace('<head>', `<head>${tenantScript}`);
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  app.use(
    '/tenant-assets',
    express.static(path.join(process.env.TENANT_ROOT || process.cwd(), 'branding', 'assets'))
  );
  const distPath =
    process.env.NODE_ENV === 'development'
      ? path.resolve(import.meta.dirname, '../..', 'dist', 'public')
      : path.resolve(import.meta.dirname, 'public');

  if (!fs.existsSync(distPath)) {
    logger.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  } else {
    // Log available HTML files for debugging
    const files = fs.readdirSync(distPath).filter((f) => f.endsWith('.html'));
    logger.info(`distPath: ${distPath}`);
    logger.info(`HTML files found: ${files.join(', ')}`);
  }

  // ===== Service Worker files need special headers =====
  // MUST be registered BEFORE express.static to intercept these specific paths
  // The Service-Worker-Allowed header allows the SW to control a broader scope than its URL

  // Admin SW: served from /admin/sw-admin.js, controls /admin/ scope
  app.get('/admin/sw-admin.js', (req, res) => {
    const swFile = path.resolve(distPath, 'admin', 'sw-admin.js');
    logger.info(`/admin/sw-admin.js → ${swFile} (exists: ${fs.existsSync(swFile)})`);
    if (!fs.existsSync(swFile)) {
      return res.status(404).send('Service Worker not found');
    }
    res.set({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/admin/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.sendFile(swFile);
  });

  // Dashboard SW fallback (backward compat)
  app.get('/admin/sw-admin.js', (req, res) => {
    const swFile = path.resolve(distPath, 'admin', 'sw-admin.js');
    if (!fs.existsSync(swFile)) {
      return res.status(404).send('Service Worker not found');
    }
    res.set({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/admin/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.sendFile(swFile);
  });

  // Public SW
  app.get('/sw.js', (req, res) => {
    const swFile = path.resolve(distPath, 'sw.js');
    if (!fs.existsSync(swFile)) {
      return res.status(404).send('Service Worker not found');
    }
    res.set({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.sendFile(swFile);
  });

  const tenantUploadPath = process.env.FILE_UPLOAD_PATH?.trim();
  if (tenantUploadPath && fs.existsSync(tenantUploadPath)) {
    app.use('/uploads', express.static(tenantUploadPath, { index: false }));
    logger.info(`Serving tenant uploads from ${tenantUploadPath}`);
  }

  // Serve static files (this handles all other assets)
  // Add Cache-Control headers for static assets
  app.use(
    express.static(distPath, {
      maxAge: '1y', // Cache static assets for 1 year
      etag: true, // Enable ETag generation
      lastModified: true, // Enable Last-Modified header
      setHeaders: (res, filePath) => {
        // Service Worker files should not be cached
        if (filePath.endsWith('sw.js') || filePath.endsWith('sw-admin.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        // HTML files should not be cached
        else if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        // Images, CSS, JS can be cached for 1 year
        else if (
          filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/) ||
          filePath.match(/\.(css|js)$/)
        ) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  // fall through to index.html or index-admin.html based on route
  app.use((req, res) => {
    const isAdminRoute =
      req.originalUrl.startsWith('/admin') || req.originalUrl.startsWith('/admin');
    const htmlFile = isAdminRoute ? 'index-admin.html' : 'index.html';
    const htmlPath = path.resolve(distPath, htmlFile);

    // Verify the file exists before serving
    if (!fs.existsSync(htmlPath)) {
      logger.error(`File not found: ${htmlPath}. Falling back to index.html`);
      return res.sendFile(path.resolve(distPath, 'index.html'));
    }

    res.sendFile(htmlPath);
  });
}
