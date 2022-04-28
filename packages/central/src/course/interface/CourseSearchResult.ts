export interface CourseSearchResult {
  hits: {
    total: any;
    hits: Array<{
      _source: any;
    }>;
  };
}
