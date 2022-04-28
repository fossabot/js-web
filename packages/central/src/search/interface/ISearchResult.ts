export interface ISearchResult {
  hits: {
    total: any;
    hits: Array<{
      _source: any;
    }>;
  };
}
