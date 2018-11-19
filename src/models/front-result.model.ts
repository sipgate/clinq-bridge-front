import { IFrontContact } from ".";

export interface IFrontResult {
  _links: {
    self: string;
  };
  _pagination: {
    prev: string | undefined;
    next: string | undefined;
  };
  _results: IFrontContact[];
}
