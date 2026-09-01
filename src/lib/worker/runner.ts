import { runPendingScans } from './scan.job';
import { logger } from '../utils/logger';

async function startWorker() {
  logger.info('🚀 AI Sentinel Background Worker started...');
  
  const pollIntervalMs = 30000; // Poll every 30 seconds

  const loop = async () => {
    try {
      await runPendingScans();
    } catch (err: any) {
      logger.error(`[Worker-Loop] Uncaught error in worker loop: ${err.message}`);
    } finally {
      setTimeout(loop, pollIntervalMs);
    }
  };

  loop();
}

if (require.main === module) {
  startWorker();
}
