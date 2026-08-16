import AdmZip from 'adm-zip';
import axios from 'axios';
import { createLogger } from '../_core/logger';

const logger = createLogger('zip-service');

export async function createFolderZipBuffer(
  files: { name: string; url: string }[]
): Promise<Buffer> {
  const zip = new AdmZip();

  for (const file of files) {
    try {
      if (!file.url) {
        continue;
      }
      const response = await axios.get(file.url, { responseType: 'arraybuffer', timeout: 15000 });
      const buffer = Buffer.from(response.data);
      zip.addFile(file.name, buffer);
    } catch (error) {
      logger.error(`Failed to fetch file ${file.name} for zip:`, error);
    }
  }

  return zip.toBuffer();
}
