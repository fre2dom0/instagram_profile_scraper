import fs from 'fs';
import { Queue } from 'js-sdsl';
import path from 'path';
import { errorLog } from './consoleLoggers.util.js';
import { giveLocalTime } from './localTime.util.js';

type TypeOfLog = 'INFO' | 'WARNING' | 'WAITING' | 'SUCCESS' | 'ERROR';
type Log = {
    message: string;
    logType?: TypeOfLog | undefined;
};

/**
 * Logger class for writing log messages to a file in FIFO order.
 * Each message is prepended with a timestamp and an optional emoji
 * representing the log type. Logs are stored as .txt files in a "log" directory.
 */
export class Logger {
    private emojiMap: Record<TypeOfLog, string> = {
        INFO: 'ℹ️',
        WARNING: '⚠️',
        WAITING: '⏳',
        ERROR: '❌',
        SUCCESS: '✅',
    };

    private queue: Queue<Log> = new Queue();
    private filePath: string; // Full path to the log file
    private logDirPath: string; // Full path to the log directory

    // State flags
    private isWriting: boolean = false;
    private initialized: boolean = false;

    /**
     * Constructor assigns file and directory paths for logging.
     * @param filename Name of the log file (without extension)
     */
    constructor(filename: string) {
        this.logDirPath = path.join(process.cwd(), 'log');
        this.filePath = path.join(this.logDirPath, `${filename}.txt`);
    }

    /**
     * Initializes the logger.
     * Ensures that the log directory exists; creates it if missing.
     * Does nothing if already initialized.
     */
    public async init() {
        if (this.initialized) return;
        await this.ensureLogDirExists();
        this.initialized = true;
    }

    /**
     * Checks if the log directory exists and creates it if it does not.
     */
    private async ensureLogDirExists() {
        try {
            await fs.promises.access(this.logDirPath);
        } catch {
            await fs.promises.mkdir(this.logDirPath, { recursive: true });
        }
    }

    /**
     * Adds a log message to the queue and triggers writing if not already in progress.
     * @param message The message to log
     * @param logType Optional type of log to prepend an emoji
     */
    public log(message: string, logType?: TypeOfLog) {
        const prefix = 'Logger-log';
        if (message == '') return;
        this.queue.push({ message, logType });

        if (!this.isWriting) {
            this.isWriting = true;
            this.write()
                .catch((error: any) => {
                    errorLog(`${prefix} Error: ${error}`);
                })
                .finally(() => {
                    this.isWriting = false;
                });
        }
    }

    /**
     * Writes queued log messages to the file asynchronously.
     * Messages are removed from the queue once written.
     */
    private async write() {
        while (!this.queue.empty()) {
            const front = this.queue.front();
            this.queue.pop();

            if (front) {
                const logMessage = `[${giveLocalTime()}] ${front.logType ? `${this.emojiMap[front.logType]} - ` : ''}${front.message}\n`;
                await fs.promises.appendFile(this.filePath, logMessage, {
                    encoding: 'utf8',
                });
            }
        }
    }
}
