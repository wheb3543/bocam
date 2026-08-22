import { Router } from 'express';
import { createLogger } from '../_core/logger';
import { installCentralLicense, type CentralLicenseFile } from '../_core/centralLicenseRequest';

const logger = createLogger('licenseDelivery');

export function createLicenseDeliveryRouter() {
  const router = Router();

  router.post('/api/license/deliver', (req, res) => {
    try {
      const license = req.body?.license as CentralLicenseFile | undefined;
      if (!license || typeof license !== 'object') {
        return res.status(400).json({ success: false, error: 'ملف الترخيص غير موجود' });
      }

      const validation = installCentralLicense(license);
      logger.info(
        `Signed license delivered directly with ${validation.features.length} enabled features`
      );
      return res.status(200).json({
        success: true,
        data: {
          hardwareId: validation.hardwareId,
          features: validation.features,
          expiresAt: validation.expiryDate,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر تثبيت ملف الترخيص';
      logger.warn(`Direct license delivery rejected: ${message}`);
      return res.status(422).json({ success: false, error: message });
    }
  });

  return router;
}
