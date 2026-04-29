// Instagram variable type

export type InstagramCursor = string | null | "no";

export type InstagramCandidates = {
    url: string;
    width: number;
    height: number;
};

export type InstagramImageVersions = {
    candidates: InstagramCandidates[];
};

export type InstagramVideoVersions = {
    url: string;
    width: number;
    height: number;
    type: number;
};

export type ProductType = "feed" | "clips" | "carousel_container";

export type InstagramCarouselMedia = {
    id: string;
    carousel_parent_id: string;
    product_type: "carousel_item";
    media_type: 1 | 2; // 1 = Photo ; 2 = Video
    image_versions2: InstagramImageVersions;
    video_versions: InstagramVideoVersions[] | null;
};

export interface InstagramPostsNode {
    id: string;
    code: string; // Url
    taken_at: number; // Date
    caption: {
        created_at: number; // Date
        text: string;
    } | null;
    product_type: ProductType;
    media_type: 1 | 2 | 8; // 1 = Photo ; 2 = Video ; 8 = Carousel
    image_versions2: InstagramImageVersions;
    video_versions: InstagramVideoVersions[] | null;
    carousel_media_count: number | null;
    carousel_media: InstagramCarouselMedia[] | null;
    timeline_pinned_user_ids: string[];
}

export interface InstagramPostsPageInfo {
    end_cursor: string | "None" | null;
    has_next_page: boolean;
    has_previous_page: boolean;
    start_cursor: string | null;
    media_type: 1 | 2 | 8; // 1 = Photo ; 2 = Video ; 8 = Carousel container
}

export type InstagramPostsEdges = {
    node: InstagramPostsNode;
}[];

export type InstagramPostsResponseDetails = {
    xdt_api__v1__feed__user_timeline_graphql_connection: {
        edges: InstagramPostsEdges;
        page_info: InstagramPostsPageInfo;
    };
};

export interface InstagramPostsResponse {
    data: InstagramPostsResponseDetails;
}

// App variable type

export type AppInstagramImageVersion = {
    url: string;
    width: number;
    height: number;
};

export type AppInstagramVideoVersion = {
    url: string;
    width: number;
    height: number;
    type: number;
};

export interface AppCarouselMedia {
    id: string;
    carousel_parent_id: string;
    product_type: "carousel_item";
    media_type: 1 | 2; // 1 = Photo ; 2 = Video
    image_version: AppInstagramImageVersion;
    video_version: AppInstagramVideoVersion | null;
}

export interface AppInstagramPosts {
    id: string;
    code: string; // Url
    taken_at: number; // Date
    caption: {
        created_at: number; // Date
        text: string;
    } | null;
    product_type: ProductType;
    media_type: 1 | 2 | 8; // 1 = Photo ; 2 = Video ; 8 = Carousel
    image_version: AppInstagramImageVersion;
    video_version: AppInstagramVideoVersion | null;
    carousel_media_count: number | null;
    carousel_media: AppCarouselMedia[] | null;
    timeline_pinned_user_ids: string[];
}

export interface AppInstagramPostsReturn {
    data: AppInstagramPosts[];
    cursor: InstagramCursor;
}
