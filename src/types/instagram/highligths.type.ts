// Instagram variable type

export interface InstagramHighlightsNode {
    id: string;
    title: string;
    cover_media: {
        cropped_image_version: {
            url: string;
        };
    };
}

export interface InstagramHighlightsResponse {
    data: {
        highlights: {
            edges: {
                node: InstagramHighlightsNode;
            }[];
        };
    };
}

// App variable type

export interface AppHighlightsNode {
    id: string;
    title: string;
    // url: string;
}
