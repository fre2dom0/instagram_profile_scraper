import { devLog } from './consoleLoggers.util.js';
import type { Logger } from './logger.util.js';
import { sleep } from './sleep.util.js';

interface RetryOptions {
    retryCount?: number; // opsiyonel, default verilecek
    initialDelaySec?: number; // opsiyonel, default 1
    maxDelaySec?: number; // opsiyonel, default 60
}

/**
 * Function retryer
 * @param fn Function to do retry
 * @param fnId Function specific id to log better
 * @param options Retry Options
 * @returns What function returns
 */
export const retryWrapper = async <T>(
    fn: () => Promise<T> | T,
    fnId: string,
    options: RetryOptions = {},
    logger?: Logger,
): Promise<T> => {
    const prefix = `[retryWrapper-${fnId}]`;
    const { retryCount = 3, initialDelaySec = 1, maxDelaySec = 60 } = options;

    let delay = initialDelaySec;
    let attempt = 0;

    while (attempt < retryCount) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;
            if (attempt >= retryCount) {
                logger?.log(`${prefix} Retrying is unsuccessfull`, 'ERROR');
                logger?.log(`${prefix} Retry reason: ${error}`, 'WARNING');

                throw error;
            }

            logger?.log(
                `${prefix} Retrying: ${attempt + 1} times...`,
                'WARNING',
            );
            devLog(`${prefix} Retrying: ${attempt + 1} times...`, 'WARNING');

            logger?.log(`${prefix} Retry reason: ${error}`, 'WARNING');
            devLog(`${prefix} Retry reason: ${error}`, 'WARNING');

            // Jitter
            const min = delay * 0.5;
            const max = delay;
            const jitteredDelay = min + Math.random() * (max - min);

            logger?.log(`${prefix} Waiting delay: ${jitteredDelay}`, 'INFO');
            devLog(`${prefix} Waiting delay: ${jitteredDelay}`, 'INFO');
            await sleep(jitteredDelay);

            delay = Math.min(delay * 2, maxDelaySec);
            logger?.log(`${prefix} New delay: ${delay}`, 'INFO');
            devLog(`${prefix} New delay: ${delay}`, 'INFO');
        }
    }

    throw new Error('[Utils-retryWrapper] unexpected exit');
};
