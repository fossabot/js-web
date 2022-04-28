export interface ISuggestSearchTermResult {
  hits: {
    total: any;
    hits: Array<{
      _source: any;
      _index: string;
    }>;
  };
  suggest: {
    [key: string]: any;
  };
}
