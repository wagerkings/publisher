// Facebook connector stub - not implemented
import { logger } from '../core/logger.js';
import type { Connector } from './connector.types.js';

export const facebookConnector: Connector = {
  async authenticate(): Promise<void> {
    logger.warn('Facebook connector not implemented');
    throw new Error('Facebook connector not implemented');
  },

  async postImage(): Promise<{ remoteId: string }> {
    logger.warn('Facebook connector not implemented');
    throw new Error('Facebook connector not implemented');
  },
};

