/**
 * Swagger API Documentation
 * توثيق API باستخدام Swagger/OpenAPI
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { asSwaggerMiddleware, asSwaggerSetupMiddleware } from './expressCompatibility';

/**
 * إعدادات Swagger
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bocam CRM API',
      version: '1.0.0',
      description: 'نظام إدارة علاقات العملاء لإدارة الحملات التسويقية والمواعيد الطبية',
      contact: {
        name: 'Bocam Team',
        email: 'support@bocam.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://staging.bocam.com',
        description: 'Staging server',
      },
      {
        url: 'https://api.bocam.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'رسالة الخطأ',
            },
            code: {
              type: 'string',
              description: 'رمز الخطأ',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'رسالة النجاح',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/**/*.ts', './server/**/*.js'],
};

/**
 * إنشاء مواصفات Swagger
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * إعداد Swagger UI middleware
 */
export function setupSwaggerDocs(app: import('express').Express) {
  // صفحة توثيق API
  app.use(
    '/api-docs',
    asSwaggerMiddleware(swaggerUi.serve),
    asSwaggerSetupMiddleware(
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Bocam CRM API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
        },
      })
    )
  );

  // مواصفات JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

/**
 * مثال على استخدام Swagger annotations في الكود
 *
 * @example
 * /**
 *  * @swagger
 *  * /api/users:
 *  *   get:
 *  *     summary: الحصول على جميع المستخدمين
 *  *     tags: [Users]
 *  *     security:
 *  *       - bearerAuth: []
 *  *     parameters:
 *  *       - in: query
 *  *         name: page
 *  *         schema:
 *  *           type: integer
 *  *         description: رقم الصفحة
 *  *       - in: query
 *  *         name: limit
 *  *         schema:
 *  *           type: integer
 *  *         description: عدد النتائج في الصفحة
 *  *     responses:
 *  *       200:
 *  *         description: قائمة المستخدمين
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               type: object
 *  *               properties:
 *  *                 users:
 *  *                   type: array
 *  *                   items:
 *  *                     $ref: '#/components/schemas/User'
 *  *       401:
 *  *         description: غير مصرح
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               $ref: '#/components/schemas/Error'
 *  *\/
 */
