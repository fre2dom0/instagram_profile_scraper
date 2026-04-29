import axios, { type AxiosResponse } from "axios";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { devLog, errorLog } from "./consoleLoggers.util.js";
import { retryWrapper } from "./retryWrapper.util.js";
import type { Logger } from "./logger.util.js";

export type Media = { folderName: string; fileName: string; url: string };

export class MediaDownloader {
    private multipleList: {
        folderName: string;
        fileName: string;
        url: string;
    }[];

    constructor() {
        this.multipleList = [];
    }

    public static async downloadMedia(folderName: string, fileName: string, url: string, logger?: Logger) {
        try {
            // Download data
            // if (logger) await logger.log(`[MediaManager-downloadMedia] Starting to install ${fileName}.`, 'WAITING');
            const { data } = await retryWrapper(
                async () => await axios.get(url, { responseType: "arraybuffer" }),
                `MediaManager-downloadMedia-${fileName}`,
                {},
                logger,
            );

            // Create folder if does not exist
            const folderPath = path.join(process.cwd(), "media", folderName);
            await mkdir(folderPath, { recursive: true });

            // Write media to disk
            const filePath = path.join(folderPath, fileName);
            await writeFile(filePath, data);

            // if (logger) await logger.log(`[MediaManager-downloadMedia] Successfully downloaded: ${fileName}`, 'SUCCESS');
        } catch (error: any) {
            errorLog(`Media download failed for ${fileName} → ${url}`);
            if (error.response) {
                errorLog(`Status: ${error.response.status}`);
            } else if (error.code) {
                errorLog(`Code: ${error.code}`);
            } else {
                errorLog(error);
            }

            if (logger) {
                await logger.log(`[downloadMedia] ${error.message ?? error.response?.message ?? ""}.`, "ERROR");
                await logger.log(`[downloadMedia] ${error}.`, "ERROR");
            }

            throw error;
        }
    }

    public async downloadMultiple(mediaList: Media[], concurrency: number = 10, logger?: Logger) {
        this.multipleList.push(...mediaList);

        if (this.multipleList.length >= concurrency) {
            // Create tasks
            const tasks = this.multipleList
                .splice(0, concurrency)
                .map((media) => MediaDownloader.downloadMedia(media.folderName, media.fileName, media.url, logger));

            try {
                await Promise.all(tasks);
                // devLog(`🎉 ${concurrency} media downloaded.`);
            } catch (error) {
                errorLog(`Multiple download failed: ${error}`);
                throw error;
            }
        }
    }

    public async flush() {
        try {
            if (this.multipleList.length > 0) {
                const tasks = this.multipleList
                    .splice(0)
                    .map((media) => MediaDownloader.downloadMedia(media.folderName, media.fileName, media.url));

                await Promise.all(tasks);
                devLog(`[flush] Remaining ${tasks.length} media downloaded.`, "SUCCESS");
            } else {
                devLog("[flush] No remaining media found.", "INFO");
            }
        } catch (error) {
            errorLog(`[flush] An error occurred while flushing: ${error}`);
            throw error;
        }
    }
}
