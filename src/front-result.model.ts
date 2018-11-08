export interface FrontResult {
    _pagination: {
        prev: string | undefined;
        next: string | undefined;
    };
    _links: {
        self: string;
    };
    _results: any;
}
