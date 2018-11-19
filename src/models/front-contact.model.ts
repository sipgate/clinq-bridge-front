export interface IFrontContactHandle {
  handle?: string | undefined;
  source: string;
}

export interface IFrontContact {
  _links: {
    self: string;
  };
  avatar_url?: string | undefined;
  description?: string | undefined;
  handles?: IFrontContactHandle[] | undefined;
  id: string;
  name?: string | undefined;
}
