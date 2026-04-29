const is_test: boolean = Boolean(process.env["TEST"]);

type TypeOfLog = "INFO" | "WARNING" | "WAITING" | "SUCCESS" | "ERROR";

const emojiMap: Record<TypeOfLog, string> = {
    INFO: "ℹ️",
    WARNING: "⚠️",
    WAITING: "⏳",
    ERROR: "❌",
    SUCCESS: "✅",
};

/**
 * Logs a message if environment is development mode.
 * @param message Logged message
 */
export const devLog = (message: any, type?: TypeOfLog) => {
    // if (node_env != 'development' || is_test) return;

    const emoji = type ? emojiMap[type] : "";
    console.log(`${emoji ? `${emoji} ` : ""}${message}`);
};

/**
 * Logs a message
 * @param message Logged message
 */
export const infoLog = (message: string, type?: TypeOfLog) => {
    if (is_test) return;

    const emoji = type ? emojiMap[type] : "";
    console.log(emoji ? `${emoji} ${message}` : message);
};

/**
 * Logs a error message
 * @param message Logged message
 */
export const errorLog = (message: unknown) => {
    if (is_test) return;
    console.error("❌", " ", message);
};
