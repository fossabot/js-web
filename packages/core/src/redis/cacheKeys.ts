export const cacheKeys = {
  COURSE: {
    CATEGORIES: 'course:categories',
    SUB_CATEGORIES: 'course:subCategories',
  },
  TOPIC: {
    TREE: 'topic:tree',
  },
  GROUP: {
    ALL: 'group:all',
    DESCENDANT_BY_GROUP_ID: 'group:id:descendant',
  },
  USER_DASHBOARD: {
    COURSES_STATS:
      'userDashboard:$userId:courses:topic:$topicId:learningWay:$learningWayId',
    LEARNING_TRACKS_STATS:
      'userDashboard:$userId:learningTracks:topic:$topicId:learningWay:$learningWayId',
    COURSE_DISCOVERY: 'userDashboard:courseDiscovery:all',
    PROMO_BANNER: 'userDashboard:promoBanner:all',
  },
};
