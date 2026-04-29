import { InstagramScraper } from "./core/scrapers/instagram.js";
import { AppHighlightsNode } from "./types/instagram/highligths.type.js";

const run = async () => {
    const instagramScraper = new InstagramScraper("", {
        cookie: "",
        crsf_token: "",
        user_agent: "Safari 17.10, Mac OS X",
    });

    await instagramScraper.init();

    const highlights: AppHighlightsNode[] = await instagramScraper.scrapeHighlights();
    if (highlights.length > 0) {
        const ids: string[] = highlights.map((highlight) => highlight.id);
        await instagramScraper.scrapeStories({ initial_reel_id: ids[0] as string, reel_ids: ids, first: 100, last: 0 }, true);
    }
    await instagramScraper.scrapePosts("no", true);
};

run();
