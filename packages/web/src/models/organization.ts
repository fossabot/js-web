export interface Organization {
  name: string;

  slug: string;

  logo?: string;

  isIdentityProvider: boolean;

  isServiceProvider: boolean;

  showOnlySubscribedCourses: boolean;
}
