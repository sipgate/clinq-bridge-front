export interface FrontContactHandle {
    source: string;
    handle?: string | undefined;
}

export interface FrontContact {
    _links: {
        self: string;
    },
    id: string;
    name?: string | undefined;
    description?: string | undefined;
    avatar_url?: string | undefined;
    handles?: FrontContactHandle[] | undefined;
}
