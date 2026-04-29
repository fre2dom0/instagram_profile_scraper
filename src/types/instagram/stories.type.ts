// Instagram variable type

export interface InstagramStoriesPageInfo {
    end_cursor: string | null;
    has_next_page: boolean,
    has_previous_page: boolean,
    start_cursor: string | null
}

export interface InstagramStoryItems {
    id: string;
    taken_at: number;
    media_type: 1 | 2; 
    product_type: 'story';
    image_versions2: {
        candidates: {
            url: string;
        }[];
    };
    video_versions: {
        url: string;
    }[] | null;
}

export interface InstagramStoriesNode {
    node: {
        id: string;
        items: InstagramStoryItems[];
    }
}

export interface InstagramStoriesResponse {
    data: {
        xdt_api__v1__feed__reels_media__connection: {
            edges: InstagramStoriesNode[];
            page_info: InstagramStoriesPageInfo
        }
    }
}

// App variable type

export interface AppInstagramStoryItems {
    id: string;
    taken_at: number;
    media_type: 1 | 2;
    image_version: string | null
    video_version: string | null;
}

export interface AppInstagramStories {
    highlight_id: string;
    items: AppInstagramStoryItems[];
}