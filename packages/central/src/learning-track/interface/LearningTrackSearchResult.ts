export interface LearningTrackSearchResult {
  hits: {
    total: any;
    hits: Array<{
      _source: any;
    }>;
  };
}
