type TypeOfLog = 'INFO' | 'WARNING' | 'WAITING' | 'SUCCESS' | 'ERROR';
/**
 * Logger class for writing log messages to a file in FIFO order.
 * Each message is prepended with a timestamp and an optional emoji
 * representing the log type. Logs are stored as .txt files in a "log" directory.
 */
export declare class Logger {
    private emojiMap;
    private queue;
    private filePath;
    private logDirPath;
    private isWriting;
    private initialized;
    /**
     * Constructor assigns file and directory paths for logging.
     * @param filename Name of the log file (without extension)
     */
    constructor(filename: string);
    /**
     * Initializes the logger.
     * Ensures that the log directory exists; creates it if missing.
     * Does nothing if already initialized.
     */
    init(): Promise<void>;
    /**
     * Checks if the log directory exists and creates it if it does not.
     */
    private ensureLogDirExists;
    /**
     * Adds a log message to the queue and triggers writing if not already in progress.
     * @param message The message to log
     * @param logType Optional type of log to prepend an emoji
     */
    log(message: string, logType?: TypeOfLog): void;
    /**
     * Writes queued log messages to the file asynchronously.
     * Messages are removed from the queue once written.
     */
    private write;
}
export {};
//# sourceMappingURL=logger.util.d.ts.map