import type {
    AppCarouselMedia,
    AppInstagramImageVersion,
    AppInstagramPosts,
    AppInstagramPostsReturn,
    AppInstagramVideoVersion,
    InstagramCursor,
    InstagramPostsEdges,
    InstagramPostsNode,
    InstagramPostsPageInfo,
    InstagramPostsResponse,
    ProductType,
} from "../../types/instagram/posts.type.js";
import type {
    InstagramStoriesPageInfo,
    InstagramStoryItems,
    InstagramStoriesNode,
    InstagramStoriesResponse,
    AppInstagramStoryItems,
    AppInstagramStories,
} from "../../types/instagram/stories.type.js";
import type { InstagramHighlightsNode, InstagramHighlightsResponse, AppHighlightsNode } from "../../types/instagram/highligths.type.js";
import type { InstagramScraperConfiguration } from "../../types/instagram/scraperConfig.js";
import type { InstagramUserApiResponse } from "../../types/instagram/user.type.js";

import { MediaDownloader, type Media } from "../../utils/mediaDownloader.util.js";
import { devLog, errorLog } from "../../utils/consoleLoggers.util.js";
import { retryWrapper } from "../../utils/retryWrapper.util.js";

import axios, { type AxiosResponse } from "axios";

type InstagramPayload = {
    av: string;
    __d: string;
    __user: string;
    __a: string;
    __req: string;
    __hs: string;
    dpr: string;
    __ccg: string;
    __rev: string;
    __s: string;
    __hsi: string;
    __dyn: string;
    __csr: string;
    __hsdp: string;
    __hblp: string;
    __sjsp: string;
    __comet_req: string;
    fb_dstg: string;
    jazoest: string;
    lsd: string;
    __spin_r: string;
    __spin_b: string;
    __spin_t: string;
    fb_api_caller_class: string;
    fb_api_req_friendly_name: string;
    server_timestamps: string;
    variables: InstagramPostVariables | InstagramStoryVariables | object;
    doc_id: string;
    __crn: string;
};

type InstagramPostVariables = {
    after: string | null;
    before: null;
    data: {
        count: number;
        include_reel_media_seen_timestamp: boolean;
        include_relationship_info: boolean;
        latest_besties_reel_media: boolean;
        latest_reel_media: boolean;
    };
    first: number;
    last: null;
    username: string;
    __relay_internal__pv__PolarisIsLoggedInrelayprovider: boolean;
};

type InstagramStoryVariables = {
    after: string | null;
    before: null;
    initial_reel_id: string;
    reel_ids: string[];
    first: number;
    last: number;
};

type InstagramHighlightVariables = {
    user_id: string;
};

export class InstagramScraper {
    private headers: object;
    private payload: InstagramPayload;
    private endpoint: string;

    private userName: string;
    public userId!: string;

    private initialized: boolean = false; // flag

    constructor(userName: string, scraperConfig: InstagramScraperConfiguration) {
        this.headers = {
            Accept: "/*",
            "Accept-Encoding": "identity",
            "Accept-Language": "en-US,en;q=0.5",
            "Cache-Control": "no-cache",
            Connection: "close",
            "User-Agent": scraperConfig.user_agent,
            "X-CSRFToken": scraperConfig.crsf_token,
            Cookie: scraperConfig.cookie,
        };

        this.payload = {
            av: "17841477854192152",
            __d: "www",
            __user: "0",
            __a: "1",
            __req: "12",
            __hs: "20436.HCSV2:instagram_web_pkg.2.1...0",
            dpr: "1",
            __ccg: "POOR",
            __rev: "1029375730",
            __s: "hb2q6j:mwdruj:mojimp",
            __hsi: "7583774611923700906",
            __dyn: "7xeUjG1mxu1syUbFp41twWwIxu13wvoKewSAwHwNw9G2S7o2vwa24o0B-q1ew6ywaq0yE462mcw5Mx62G5UswoEcE7O2l0Fwqo31w9O1lwxwQzXwae4UaEW2G0AEco5G1Wxfxm16wUwtE1wEbUGdG1QwTU9UaQ0Lo6-3u2WE5B08-269wr86C1mgcEed6hEhK2O4Xxui2qi7E5y4UrwHwGwa6bBK4o16UeUG3a18whE984O",
            __csr: "hG3n7gq_NkcOgmYAytgwBdPnuOQ_aJllqiPt5iGRBRiicLiubJt8Ixh7GqCV4mGVteOdtacQ6oG4FFHLDGAF6QqfGqm5XBGqaBCAxyaBKmGAKirKVFm5aK48gy8hGdy9aJ5-m68N9eldKHBz_osBAxVuKcgGmiFEgKcGqAWBgzGiF8Gc-8y8gKlpEkwwy8CEK5oKbx6cwCw_w05AOwfS36iu9g4O684i2Odw6h8eUnx60gTExUaYE2IF16260dnw3Ve1Jw73w388jgmw2xE-twvm2rU8i0de58mU-6e4oSaIR02d817E7C53260ii19wiPG8w5kw4Zyz016-eAwtzUxgCEak5Elx500i4E0bqEqweJw2-E0ndw1Te",
            __hsdp: "go490A84g9L5hcen4nQBkyQBkcAHakt5cyNHkuR9GQAAyGsL8BOwHg_yrB1u61gBxKYwR0pm9gkEorggpSO1p6Axt196gf9pOei2KhAxeiaoiAzo8U4Cm484Ii0OEC1SUK5Egwioc-1uo9U2gwFAwSgW58txe6GwAy8ox-qawo8W3m5U1jE0gBxi0pa13xa1LwaS3q1Dx63C5U1uu1YwcC0Jo0wW0s29wVwBw9KbwwwJx91a3m320Po",
            __hblp: "0Sw9u8U666UixR1mHxa8G0wovwjEkz86mqdzFQby9QE88Ki1sCzVHgizVJ1WvQ5uim2K19GEgz8hwfJUC2e4EdFb-9AKdDy89oiUW2qqng5aaUK6U23z89rAyob5z8F28sgSm6Gwzgybz8vKHCBwwUdUW3m5UfEixu0V81uEow2sEuxi0pa3efxa1Lwio6e3qu1vx62249UyewUw860P89o4G0Oo2Rw-w6nwRU2jwcO1ugC2-9y8swpVUaVppEiCyo8UC8gGp0RwMwiU21wAw",
            __sjsp: "go490A84g9L5hcen4nQBkyGBkAa4Hakt5cyNHkuR9GQAAA5ie16yrBS81461g9XO3k1BoG5a66UhpSUpg8Q1oBwh6",
            __comet_req: "7",
            fb_dstg: "NAft5OxPkPaKeoq_UUXJiMbOw0VTiJx_CCpYyDzrogUKIQx7ypAGJ0A:17843676607167008:1765557836",
            jazoest: "26455",
            lsd: "Y1FfvOxveUw5nYNKm5_Wwg",
            __spin_r: "1031067272",
            __spin_b: "trunk",
            __spin_t: "1765735124",
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "",
            server_timestamps: "true",
            variables: {},
            doc_id: "",
            __crn: "comet.igweb.PolarisProfilePostsTabRoute",
        };

        this.endpoint = "https://www.instagram.com/graphql/query";
        this.userName = userName;
    }

    public async init() {
        if (this.initialized) return;
        this.initialized = true;

        await this.scrapeUserId();

        if (!this.userId) {
            errorLog(`No user ID found for: ${this.userName}`);
        }
    }

    public async scrapePosts(cursor: InstagramCursor, downloadMedia = false): Promise<AppInstagramPostsReturn | AppInstagramPosts[]> {
        const mediaDownloader = new MediaDownloader();

        const headers = this.headers;
        const payload: InstagramPayload = structuredClone(this.payload);

        const friendly_name: string = "PolarisProfilePostsTabContentQuery_connection";
        const doc_id: string = "33066505549662251";
        const variables: InstagramPostVariables = {
            after: cursor == "no" ? null : cursor,
            before: null,
            data: {
                count: 100,
                include_reel_media_seen_timestamp: true,
                include_relationship_info: true,
                latest_besties_reel_media: true,
                latest_reel_media: true,
            },
            first: 33,
            last: null,
            username: this.userName,
            __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
        };

        payload["doc_id"] = doc_id;
        payload["fb_api_req_friendly_name"] = friendly_name;
        payload["variables"] = variables;

        const returnData: AppInstagramPosts[] = [];

        while (true) {
            try {
                devLog(`[InstagramScraper-scrapePosts] Scraping posts of: ${this.userId}:${this.userName}`, "WAITING");
                devLog(`[InstagramScraper-scrapePosts] Cursor for ${this.userId}:${this.userName}: ${cursor}`, "WAITING");

                // Get data
                const response: AxiosResponse<InstagramPostsResponse> = await retryWrapper(
                    () => axios.post(this.endpoint, payload, { headers }),
                    `InstagramScraper-scrapePosts-${this.userName}`,
                );

                devLog(`[InstagramScraper-scrapePosts] Response status for ${this.userId}:${this.userName}: ${response.status}`, "INFO");
                devLog(`[InstagramScraper-scrapePosts] Posts successfully scraped for ${this.userId}:${this.userName}`, "SUCCESS");

                // Assign response data
                const profileData = response.data;
                const allMedias: InstagramPostsEdges = profileData.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges;

                devLog(`[InstagramScraper-scrapePosts] Incoming data length for ${this.userId}:${this.userName}: ${allMedias.length}`, "INFO");

                if (allMedias.length == 0) throw new Error(`No media found for ${this.userId}:${this.userName}.`);

                // Assign page info
                const pageInfo: InstagramPostsPageInfo = profileData.data.xdt_api__v1__feed__user_timeline_graphql_connection.page_info;
                devLog(
                    `[InstagramScraper-scrapePosts] Page info for ${this.userId}:${this.userName}: ${pageInfo.end_cursor} - ${pageInfo.has_next_page}`,
                    "INFO",
                );

                const mediaObjList: AppInstagramPosts[] = [];

                for (const media of allMedias) {
                    const node: InstagramPostsNode = media.node;

                    // Define variables
                    let mediaObj: AppInstagramPosts;
                    let carouselMediaObj: AppCarouselMedia;
                    const carouselMediaObjList: AppCarouselMedia[] = [];
                    const product_type: ProductType = node.product_type;

                    // Process carousel
                    if (product_type == "carousel_container" && node.carousel_media) {
                        for (const carouselMedia of node.carousel_media) {
                            carouselMediaObj = {
                                id: carouselMedia.id,
                                carousel_parent_id: carouselMedia.carousel_parent_id,
                                product_type: carouselMedia.product_type,
                                media_type: carouselMedia.media_type,
                                image_version: carouselMedia.image_versions2.candidates[0] as AppInstagramImageVersion,
                                video_version: carouselMedia.video_versions ? (carouselMedia.video_versions[0] as AppInstagramVideoVersion) : null,
                            };

                            carouselMediaObjList.push(carouselMediaObj);
                        }
                    }

                    // eslint-disable-next-line prefer-const
                    mediaObj = {
                        id: node.id,
                        code: node.code,
                        taken_at: node.taken_at,
                        caption: node.caption,
                        product_type: node.product_type,
                        media_type: node.media_type,
                        image_version: node.image_versions2.candidates[0] as AppInstagramImageVersion,
                        video_version: node.video_versions ? (node.video_versions[0] as AppInstagramVideoVersion) : null,
                        carousel_media_count: node.carousel_media_count,
                        carousel_media: carouselMediaObjList.length > 0 ? carouselMediaObjList : null,
                        timeline_pinned_user_ids: node.timeline_pinned_user_ids,
                    };

                    if (downloadMedia) {
                        const folderName: string = "instagram/" + this.userName + "/posts";
                        const defaultfileName: string = `${mediaObj.taken_at}-${mediaObj.code}-${mediaObj.id}`;
                        const mediaList: Media[] = [];
                        // Make it fit for downloading
                        if (product_type == "feed") {
                            const fileName = defaultfileName + `.jpg`;
                            const media: Media = {
                                folderName,
                                fileName,
                                url: mediaObj.image_version.url,
                            };
                            mediaList.push(media);
                        } else if (product_type == "clips") {
                            if (mediaObj.video_version?.url) {
                                const fileName = defaultfileName + `.mp4`;
                                const media: Media = {
                                    folderName,
                                    fileName,
                                    url: mediaObj.video_version?.url,
                                };
                                mediaList.push(media);
                            }
                        } else if (product_type == "carousel_container" && mediaObj.carousel_media) {
                            for (const carouselMedia of mediaObj.carousel_media) {
                                if (carouselMedia.media_type == 1) {
                                    const fileName = defaultfileName + `-${carouselMedia.id}.jpg`;
                                    const media: Media = {
                                        folderName,
                                        fileName,
                                        url: carouselMedia.image_version.url,
                                    };
                                    mediaList.push(media);
                                } else if (carouselMedia.media_type == 2) {
                                    if (carouselMedia.video_version?.url) {
                                        const fileName = defaultfileName + `-${carouselMedia.id}.mp4`;
                                        const media: Media = {
                                            folderName,
                                            fileName,
                                            url: carouselMedia.video_version.url,
                                        };
                                        mediaList.push(media);
                                    }
                                }
                            }
                        }

                        await mediaDownloader.downloadMultiple(mediaList, 5);
                    }

                    mediaObjList.push(mediaObj);
                }

                if (cursor !== "no") {
                    const returnData: AppInstagramPostsReturn = {
                        data: mediaObjList,
                        cursor: pageInfo.end_cursor == "None" || pageInfo.end_cursor == null ? null : pageInfo.end_cursor,
                    };

                    return returnData;
                }

                if (pageInfo.end_cursor == "None" || pageInfo.end_cursor == null) {
                    await mediaDownloader.flush();
                    break;
                }

                returnData.push(...mediaObjList);
                variables["after"] = pageInfo.end_cursor;
            } catch (error: any) {
                errorLog(`[scrapePosts] Error: ${error}`);
                await mediaDownloader.flush();

                throw error;
            }
        }

        return returnData;
    }

    public async scrapeHighlights(): Promise<AppHighlightsNode[]> {
        if (!this.userId) throw new Error(`No user ID found for ${this.userName}.`);

        const headers = this.headers;
        const payload: InstagramPayload = structuredClone(this.payload);

        const friendly_name: string = "PolarisProfileStoryHighlightsTrayContentQuery";
        const doc_id: string = "9814547265267853";
        const variables: InstagramHighlightVariables = {
            user_id: this.userId,
        };

        payload["doc_id"] = doc_id;
        payload["fb_api_req_friendly_name"] = friendly_name;
        payload["variables"] = variables;

        try {
            devLog(`[InstagramScraper-scrapeHighlights] Scraping highligts of: ${this.userId}:${this.userName}`, "INFO");

            const response: AxiosResponse<InstagramHighlightsResponse> = await retryWrapper(
                () => axios.post(this.endpoint, payload, { headers }),
                `InstagramScraper-scrapeHighlights-${this.userName}`,
            );
            devLog(`[InstagramScraper-scrapeHighlights] Response status for ${this.userId}:${this.userName}: ${response.status}`, "INFO");

            const allHighlights = response.data.data.highlights.edges;
            devLog(`[InstagramScraper-scrapeHighlights] Highlight count: ${allHighlights.length}`, "INFO");

            const highlightObjList: AppHighlightsNode[] = [];

            for (const highlight of allHighlights) {
                const node: InstagramHighlightsNode = highlight.node;
                const highlightObj: AppHighlightsNode = {
                    id: node.id,
                    title: node.title,
                };

                highlightObjList.push(highlightObj);
            }

            return highlightObjList;
        } catch (error) {
            errorLog(`[scrapeHighlights] Error: ${error}`);
            throw error;
        }
    }

    public async scrapeStories(
        {
            initial_reel_id,
            reel_ids,
            first,
            last,
        }: {
            initial_reel_id: string;
            reel_ids: string[];
            first: number;
            last: number;
        },
        downloadMedia = false,
    ) {
        if (!this.userId) throw new Error(`No user ID found for ${this.userName}.`);

        const mediaDownloader = new MediaDownloader();

        const headers = this.headers;
        const payload: InstagramPayload = structuredClone(this.payload);

        const friendly_name: string = "fb_api_req_friendly_name";
        const doc_id = "31842794902034649";

        const variables: InstagramStoryVariables = {
            after: null as string | null,
            before: null,
            initial_reel_id,
            reel_ids,
            first,
            last,
        };

        payload["doc_id"] = doc_id;
        payload["fb_api_req_friendly_name"] = friendly_name;
        payload["variables"] = variables;

        try {
            let waveNumber: number = 0;
            let totalMediaCount: number = 0;

            while (true) {
                waveNumber++;

                devLog(`[InstagramScraper-scrapeStories] Scraping stories of: ${this.userId}:${this.userName}-${waveNumber}`, "WAITING");
                // Get data
                const response: AxiosResponse<InstagramStoriesResponse> = await retryWrapper(
                    () => axios.post(this.endpoint, payload, { headers }),
                    `InstagramScraper-scrapeStories--${this.userName}`,
                );
                devLog(`[InstagramScraper-scrapeStories] Response status for ${this.userId}:${this.userName}: ${response.status}`);

                devLog(
                    `[InstagramScraper-scrapeStories] Stories successfully scraped for ${this.userId}:${this.userName}: Wave - ${waveNumber}`,
                    "SUCCESS",
                );

                const allStories: InstagramStoriesNode[] = response.data.data.xdt_api__v1__feed__reels_media__connection.edges;
                devLog(`[InstagramScraper-scrapeStories] Incoming data length for ${this.userId}:${this.userName}: ${allStories.length}`, "INFO");

                if (allStories.length == 0) throw new Error(`No story found for ${this.userId}:${this.userName}.`);

                // Assign page info
                const pageInfo: InstagramStoriesPageInfo = response.data.data.xdt_api__v1__feed__reels_media__connection.page_info;
                devLog(
                    `[InstagramScraper-scrapeStories] Page info for ${this.userId}:${this.userName}: ${pageInfo.end_cursor} - ${pageInfo.has_next_page}`,
                    "INFO",
                );

                for (const story of allStories) {
                    const node = story.node;
                    const storyItems: InstagramStoryItems[] = node.items;
                    let storyObj: AppInstagramStories;
                    let itemObjList: AppInstagramStoryItems[] = [];

                    for (const item of storyItems) {
                        totalMediaCount++;
                        const media_type = item.media_type;

                        const itemObj: AppInstagramStoryItems = {
                            id: item.id,
                            taken_at: item.taken_at,
                            media_type: media_type,
                            image_version: item.image_versions2.candidates[0]?.url ?? null,
                            video_version: item.video_versions && item.video_versions[0]?.url ? item.video_versions[0]?.url : null,
                        };

                        if (downloadMedia) {
                            const folderName: string = "instagram/" + this.userName + "/stories";
                            const defaultfileName: string = `${item.taken_at}-${node.id}-${item.id}`;
                            let mediaList: Media[] = [];
                            if (media_type == 1) {
                                if (itemObj.image_version) {
                                    const fileName = defaultfileName + `.jpg`;
                                    const media: Media = {
                                        folderName,
                                        fileName,
                                        url: itemObj.image_version,
                                    };
                                    mediaList.push(media);
                                }
                            } else if (media_type == 2) {
                                if (itemObj.video_version) {
                                    const fileName = defaultfileName + `.mp4`;
                                    const media: Media = {
                                        folderName,
                                        fileName,
                                        url: itemObj.video_version,
                                    };
                                    mediaList.push(media);
                                }
                            }

                            await mediaDownloader.downloadMultiple(mediaList, 5);
                        }

                        itemObjList.push(itemObj);
                    }

                    storyObj = {
                        highlight_id: node.id,
                        items: itemObjList,
                    };
                }

                if (!pageInfo.has_next_page) {
                    await mediaDownloader.flush();
                    break;
                }

                variables["after"] = pageInfo.end_cursor;
            }

            devLog(`[InstagramScraper-scrapeStories] Total media count for ${this.userId}:${this.userName}: ${totalMediaCount}`, "INFO");
        } catch (error: any) {
            errorLog(`[scrapeStories] Error: ${error}`);
            throw error;
        }
    }

    public async scrapeUserId(): Promise<string> {
        if (this.userId) return this.userId;

        const endpoint = "https://www.instagram.com/api/v1/users/web_profile_info/?username=" + this.userName;
        const headers = {
            Accept: "*/*",
            "Accept-Encoding": "identity",
            "Accept-Language": "en-US,en;q=0.5",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "X-IG-App-ID": "936619743392459",
            "X-CSRFToken": "QjDi-fE9zKa5Brc7JSWLVH",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0",
        };

        try {
            const response: AxiosResponse<InstagramUserApiResponse> = await retryWrapper(
                () => axios.get(endpoint, { headers }),
                `InstagramScraper-scrapeUserId--${this.userName}`,
            );

            this.userId = response.data.data.user.id;
            if (!this.userId) throw new Error("No user ID found");
            devLog(`[InstagramScraper-scrapeUserId] User ID scraped for ${this.userId}:${this.userName}`, "SUCCESS");

            return this.userId;
        } catch (error: any) {
            errorLog(`[scrapeUserId] Error:, ${error.response?.status}, ${error.message}`);
            throw error;
        }
    }
}

// const test = async () => {
//     const scraper = new InstagramScraper('3not3important3', InstagramInstance);
//     const scraper2 = new InstagramScraper('hyacinth0_0i', InstagramInstance);
//     const scraper3 = new InstagramScraper('antheaelty', InstagramInstance);
//     await scraper.init();
//     await scraper2.init();
//     await scraper3.init();

//     scraper.scrapePosts(null);
//      scraper2.scrapePosts(null);
//      scraper3.scrapePosts(null);
// };

// test();
