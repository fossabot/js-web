import { In, Repository } from 'typeorm';
import { flatten, uniqBy } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { addMonths, isAfter, isBefore } from 'date-fns';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { User } from '@seaccentral/core/dist/user/User.entity';
import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';
import { CourseCategoryKey } from '@seaccentral/core/dist/course/CourseCategory.entity';
import { UserEnrolledCourse } from '@seaccentral/core/dist/course/UserEnrolledCourse.entity';
import { CourseAccessCheckerService } from '@seaccentral/core/dist/course/courseAccessCheckerService.service';
import { UserEnrolledLearningTrack } from '@seaccentral/core/dist/learning-track/UserEnrolledLearningTrack.entity';
import {
  LearningWay,
  LearningWayKey,
} from '@seaccentral/core/dist/learning-way/LearningWay.entity';
import { dateToUTCDate } from '@seaccentral/core/dist/utils/date';
import { SYSTEM_ROLES } from '@seaccentral/core/dist/utils/constants';
import { UserSearchHistory } from '@seaccentral/core/dist/search/UserSearchHistory.entity';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';
import { UserAssignedCourse } from '@seaccentral/core/dist/course/UserAssignedCourse.entity';
import { UserAssignedLearningTrack } from '@seaccentral/core/dist/learning-track/UserAssignedLearningTrack.entity';

import { SearchQueryDto } from './dto/SearchQuery.dto';
import { ISearchResult } from './interface/ISearchResult';
import { SearchHistoryBody } from './dto/SearchHistoryBody.dto';
import { ISearchCountResult } from './interface/ISearchCountResult';
import { InstructorService } from '../instructor/instructor.service';
import { ISuggestSearchTermResult } from './interface/ISuggestSearchTermResult';

enum SearchType {
  COURSE = 'course',
  LEARNING_TRACK = 'learningTrack',
  LINE_OF_LEARNING = 'lineOfLearning',
  INSTRUCTOR = 'instructor',
}

@Injectable()
export class SearchService {
  private courseIndex = 'courses';

  private instructorIndex = 'instructors';

  private learningTrackIndex = 'learning-tracks';

  private logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(UserSearchHistory)
    private userSearchHistoryRepository: Repository<UserSearchHistory>,
    @InjectRepository(UserEnrolledCourse)
    private userEnrolledCourseRepository: Repository<UserEnrolledCourse>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(LearningTrack)
    private learningTrackRepository: Repository<LearningTrack>,
    @InjectRepository(UserEnrolledLearningTrack)
    private userEnrolledLearningTrackRepository: Repository<UserEnrolledLearningTrack>,
    @InjectRepository(UserAssignedCourse)
    private userAssignedCourseRepository: Repository<UserAssignedCourse>,
    @InjectRepository(UserAssignedLearningTrack)
    private userAssignedLearningTrackRepository: Repository<UserAssignedLearningTrack>,
    @InjectRepository(LearningWay)
    private learningWayRepository: Repository<LearningWay>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly instructorService: InstructorService,
    private readonly courseAccessCheckerService: CourseAccessCheckerService,
  ) {}

  async search({
    query,
    skip,
    take,
    user,
  }: {
    query: SearchQueryDto;
    skip: number;
    take: number;
    user: User;
  }) {
    let learningWayId;
    let myCourseIds: string[] = [];
    let myLearningTrackIds: string[] = [];
    let userEnrolledCourses: UserEnrolledCourse[] = [];
    let hasEmptyAssignedCourse = false;
    let hasEmptyAssignedLearningTrack = false;

    const subscribedOnly =
      await this.courseAccessCheckerService.shouldOnlyShowSubscribedCourses(
        user,
      );

    if (subscribedOnly) {
      const courseIds =
        await this.courseAccessCheckerService.getSubscribedCourseIds(user);
      myCourseIds.push(...courseIds);
    }

    if (query.assignmentType) {
      const userAssignedCourses = await this.userAssignedCourseRepository.find({
        where: { userId: user.id, assignmentType: query.assignmentType },
      });

      if (userAssignedCourses.length < 1) {
        hasEmptyAssignedCourse = true;
      }

      myCourseIds.push(...userAssignedCourses.map((uac) => uac.courseId));
    }

    if (query.learningTrackAssignmentType) {
      const userAssignedLearningTracks =
        await this.userAssignedLearningTrackRepository.find({
          where: {
            userId: user.id,
            assignmentType: query.learningTrackAssignmentType,
          },
        });

      if (userAssignedLearningTracks.length < 1) {
        hasEmptyAssignedLearningTrack = true;
      }

      myLearningTrackIds.push(
        ...userAssignedLearningTracks.map((ualt) => ualt.learningTrackId),
      );
    }

    try {
      if (query.myCourse === '1') {
        userEnrolledCourses = await this.userEnrolledCourseRepository.find({
          where: {
            user,
            isActive: true,
          },
          relations: ['course'],
        });

        const userEnrolledCourseIds = userEnrolledCourses.map(
          (uec) => uec.course.id,
        );
        if (subscribedOnly) {
          myCourseIds = myCourseIds.filter((courseId) =>
            userEnrolledCourseIds.includes(courseId),
          );
        } else {
          myCourseIds.push(...userEnrolledCourseIds);
        }
      }

      if (query.myLearningTrack === '1') {
        const userEnrolledLearningTracks =
          await this.userEnrolledLearningTrackRepository.find({
            where: {
              user,
              isActive: true,
            },
            relations: ['learningTrack'],
          });

        myLearningTrackIds = userEnrolledLearningTracks.map(
          (uelt) => uelt.learningTrack.id,
        );
      }

      if (query.lineOfLearning) {
        const learningWay = await this.learningWayRepository.findOne({
          where: {
            key: query.lineOfLearning,
          },
        });

        learningWayId = learningWay?.id;
      }

      const coursesSearchResult = await this.getCourses({
        query,
        from: skip,
        size: take,
        myCourseIds,
        skipDetails: query.type !== SearchType.COURSE,
        hasEmptyAssignedCourse,
      });

      const linesOfLearningSearchResult = await this.getCourses({
        query,
        from: skip,
        size: take,
        myCourseIds,
        learningWayId,
        skipDetails: query.type !== SearchType.LINE_OF_LEARNING,
        hasEmptyAssignedCourse,
      });

      const learningTracksSearchResult = await this.getLearningTracks({
        query,
        from: skip,
        size: take,
        myLearningTrackIds,
        skipDetails: query.type !== SearchType.LEARNING_TRACK,
        hasEmptyAssignedLearningTrack,
      });

      const instructorsSearchResult = await this.getInstructors({
        query,
        from: skip,
        size: take,
        skipDetails: query.type !== SearchType.INSTRUCTOR,
      });

      const coursesWithDetail = await this.findSearchDetailByIds(
        coursesSearchResult.data.map((c) => c.id),
        user,
      );

      const lineOfLearningWithDetail = await this.findSearchDetailByIds(
        linesOfLearningSearchResult.data.map((c) => c.id),
        user,
      );

      const learningTracksWithDetail = await this.findLTSearchDetailByIds(
        learningTracksSearchResult.data.map((lt) => lt.id),
        user,
      );

      const instructorsWithDetail = await this.instructorService.getByIds(
        instructorsSearchResult.data.map((d) => d.id),
        true,
      );

      return {
        result: {
          [SearchType.COURSE]: this.mapCoursesSearchResponse(
            coursesSearchResult,
            coursesWithDetail,
            userEnrolledCourses,
          ),
          [SearchType.LINE_OF_LEARNING]: this.mapCoursesSearchResponse(
            linesOfLearningSearchResult,
            lineOfLearningWithDetail,
            userEnrolledCourses,
          ),
          [SearchType.LEARNING_TRACK]: this.mapLTSearchResponse(
            learningTracksSearchResult,
            learningTracksWithDetail,
          ),
          [SearchType.INSTRUCTOR]: this.mapInstructorSearchResponse(
            instructorsSearchResult,
            instructorsWithDetail,
          ),
        },
        totalRecords:
          coursesSearchResult?.totalRecords ||
          linesOfLearningSearchResult?.totalRecords ||
          learningTracksSearchResult?.totalRecords ||
          instructorsSearchResult?.totalRecords ||
          0,
      };
    } catch (err) {
      this.logger.error('Search error', err);
      throw err;
    }
  }

  async suggestTerms(term: string, lang: LanguageCode, user: User) {
    const subscribedOnly =
      await this.courseAccessCheckerService.shouldOnlyShowSubscribedCourses(
        user,
      );

    const filter: any[] = [];

    if (subscribedOnly) {
      const courseIds =
        await this.courseAccessCheckerService.getSubscribedCourseIds(user);
      filter.push({
        bool: {
          should: [
            // automatically include if not course
            {
              bool: {
                must_not: {
                  term: { _index: this.courseIndex },
                },
              },
            },
            // if it is course, must match ids
            {
              bool: {
                must: [
                  { term: { _index: this.courseIndex } },
                  { ids: { values: courseIds } },
                ],
              },
            },
          ],
        },
      });
    }

    const { body } =
      await this.elasticsearchService.search<ISuggestSearchTermResult>({
        index: [
          this.courseIndex,
          this.learningTrackIndex,
          this.instructorIndex,
        ],
        body: {
          indices_boost: {
            [this.courseIndex]: 2,
            [this.learningTrackIndex]: 1.3,
            [this.instructorIndex]: 1.1,
          },

          query: {
            bool: {
              must: {
                multi_match: {
                  query: term,
                  type: 'bool_prefix',
                  fields: [
                    'titleEn',
                    'titleTh',
                    'firstName',
                    'lastName',
                    'email',
                  ],
                },
              },
              filter,
            },
          },

          size: 5,
        },
      });

    const { total, hits } = body.hits;

    return {
      data: hits.map((item) => {
        if (item._index === this.instructorIndex) {
          return {
            term: `${item._source.firstName} ${item._source.lastName}`.trim(),
            type: 'instructor',
          };
        }

        const indexOfEn = item._source?.titleEn
          ?.toLowerCase()
          .trim()
          .indexOf(term.toLowerCase().trim());
        const indexOfTh = item._source?.titleTh
          ?.toLowerCase()
          .trim()
          .indexOf(term.toLowerCase().trim());

        const type =
          item._index === this.courseIndex ? 'course' : 'learningTrack';

        if ((indexOfEn < 0 && indexOfTh < 0) || indexOfEn === indexOfTh) {
          const textToUse =
            lang === LanguageCode.EN
              ? item._source?.titleEn
              : item._source?.titleTh;
          return { term: textToUse, type };
        }

        const textToUse =
          (indexOfEn > -1 && indexOfEn <= indexOfTh) || indexOfTh < 0
            ? item._source?.titleEn
            : item._source.titleTh;

        return { term: textToUse, type };
      }),
      total: total.value,
    };
  }

  async findMyRecentHistories(user: User) {
    const userSearchHistories = await this.userSearchHistoryRepository
      .createQueryBuilder('ushr')
      .where({ user: { id: user.id } })
      .distinct(true)
      .orderBy({ 'ushr.createdAt': 'DESC' })
      .take(5)
      .getMany();

    return userSearchHistories;
  }

  async addMyHistory(searchHistoryBody: SearchHistoryBody, user: User) {
    const filteredTerm = searchHistoryBody.term
      .toLowerCase()
      .trim()
      .substring(0, 100)
      .trim();

    const recentSearchHistories = await this.findMyRecentHistories(user);
    const existingHit = recentSearchHistories.find(
      (rsh) => rsh.term === filteredTerm,
    );

    if (existingHit) {
      return;
    }

    await this.userSearchHistoryRepository.save({
      user,
      term: filteredTerm,
      type: searchHistoryBody.type,
    });
  }

  async removeInstructorsFromIndex(instructorIds: string[]) {
    if (instructorIds.length <= 0) {
      return;
    }

    const { body } = await this.elasticsearchService.deleteByQuery({
      index: this.instructorIndex,
      body: {
        query: {
          bool: {
            must: [{ terms: { id: instructorIds } }],
          },
        },
      },
    });

    if (body.deleted > 0) {
      this.logger.log(`Successfully deleted ${body.deleted} instructors`);
    }
  }

  async isIndexExists(index: string) {
    const instIndex = await this.elasticsearchService.indices
      .get({ index })
      .catch((e) => this.logger.log(`Index ${index} not found.`, e));

    return !!instIndex;
  }

  async reindexInstructors() {
    const existingIndex = await this.isIndexExists(this.instructorIndex);

    if (existingIndex) {
      await this.elasticsearchService.indices.delete({
        index: this.instructorIndex,
      });
    }

    await this.createInstructorIndex();
    const instructors = await this.instructorService.getAll();
    await this.bulkIndexInstructors(instructors);
  }

  async createInstructorIndex() {
    await this.elasticsearchService.indices.create({
      index: this.instructorIndex,
      body: {
        settings: {
          analysis: {
            analyzer: {
              autocomplete: {
                tokenizer: 'autocomplete',
                filter: ['lowercase', 'word_delimiter_graph'],
              },
              autocomplete_search: {
                tokenizer: 'lowercase',
              },
            },
            tokenizer: {
              autocomplete: {
                type: 'edge_ngram',
                min_gram: 3,
                max_gram: 15,
                token_chars: ['letter', 'digit'],
              },
            },
          },
        },
        mappings: {
          properties: {
            email: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
            },
            firstName: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
            },
            id: { type: 'text' },
            isActivated: { type: 'boolean' },
            isActive: { type: 'boolean' },
            lastName: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
            },
            role: { type: 'text' },
          },
        },
      },
    });
  }

  async bulkIndexInstructors(instructors: User[]) {
    const existingIndex = await this.isIndexExists(this.instructorIndex);

    if (!existingIndex) {
      await this.createInstructorIndex();
    }

    const res = await this.elasticsearchService
      .bulk({
        index: this.instructorIndex,
        refresh: true,
        body: flatten(
          instructors.map((i) => {
            return [
              {
                index: {
                  _index: this.instructorIndex,
                  _id: i.id,
                },
              },
              {
                id: i.id,
                firstName: i.firstName,
                lastName: i.lastName,
                email: i.email,
                gender: i.gender,
                imageKey: i.profileImageKey,
                isActivated: i.isActivated,
                isActive: i.isActive,
                role: SYSTEM_ROLES.INSTRUCTOR,
              },
            ];
          }),
        ),
      })
      .catch((error) =>
        this.logger.error('Error bulk inserting instructors', error),
      );

    if (res?.body.errors) {
      this.logger.error(res.body);
    }
  }

  private findSearchDetailByIds(ids: string[], user: User) {
    if (ids.length < 1) return [];

    return this.courseRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect(
        'c.courseOutline',
        'courseOutline',
        'courseOutline.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'c.userAssignedCourse',
        'userAssignedCourse',
        'userAssignedCourse.userId = :userId',
        { userId: user.id },
      )
      .where('c.id IN (:...ids)', { ids })
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  private findLTSearchDetailByIds(ids: string[], user: User) {
    if (ids.length < 1) return [];

    return this.learningTrackRepository
      .createQueryBuilder('lt')
      .leftJoinAndSelect(
        'lt.userAssignedLearningTrack',
        'userAssignedLearningTrack',
        'userAssignedLearningTrack.userId = :userId',
        { userId: user.id },
      )
      .where('lt.id IN (:...ids)', { ids })
      .orderBy('lt.createdAt', 'DESC')
      .getMany();
  }

  private async getCourses({
    query,
    from,
    size,
    myCourseIds,
    learningWayId,
    skipDetails = false,
    hasEmptyAssignedCourse = false,
  }: {
    query: SearchQueryDto;
    myCourseIds: string[];
    skipDetails: boolean;
    learningWayId?: string;
    from: number;
    size: number;
    hasEmptyAssignedCourse: boolean;
  }) {
    let filters: any[] = [];

    if (query.myCourse === '1' && myCourseIds.length < 1) {
      return { count: 0, data: [] };
    }

    if (query.assignmentType && hasEmptyAssignedCourse) {
      return { count: 0, data: [] };
    }

    if (myCourseIds.length > 0) {
      filters = [
        {
          ids: {
            values: myCourseIds,
          },
        },
      ];
    }

    if (query.language && query.language !== CourseLanguage.ALL) {
      filters.push({
        term: {
          language: query.language,
        },
      });
    }

    if (
      query.courseCategory === CourseCategoryKey.ONLINE_LEARNING ||
      query.lineOfLearning === LearningWayKey.ONLINE
    ) {
      if (query.durationStart && query.durationEnd) {
        filters.push({
          range: {
            duration: {
              gte: query.durationStart,
              lte: query.durationEnd,
            },
          },
        });
      } else if (query.durationStart) {
        filters.push({
          range: {
            duration: {
              gte: query.durationStart,
            },
          },
        });
      } else if (query.durationEnd) {
        filters.push({
          range: {
            duration: {
              lte: query.durationEnd,
            },
          },
        });
      }
    }

    const countResponse =
      await this.elasticsearchService.count<ISearchCountResult>({
        index: this.courseIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: query.term.toLowerCase(),
                    fuzziness: 'AUTO',
                    minimum_should_match: '20%',
                    fields: ['titleEn', 'titleTh'],
                  },
                },
              ],
              filter: filters,
            },
          },
        },
      });

    if (skipDetails) {
      return {
        count: countResponse.body.count,
        data: [],
      };
    }

    const matchQuery = [];
    if (query.type === SearchType.COURSE && !!query.courseCategory) {
      if (query.courseCategory === CourseCategoryKey.ONLINE_LEARNING) {
        matchQuery.push({
          match: {
            categoryKey: query.courseCategory,
          },
        });
      } else {
        matchQuery.push({
          match: {
            subCategoryKeys: query.courseCategory,
          },
        });
      }
    }

    if (query.type === SearchType.LINE_OF_LEARNING && !!learningWayId) {
      matchQuery.push({
        match: {
          learningWayIds: learningWayId,
        },
      });
    }

    const resp = await this.elasticsearchService.search<ISearchResult>({
      index: this.courseIndex,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.term,
                  fuzziness: 'AUTO',
                  minimum_should_match: '20%',
                  fields: ['titleEn', 'titleTh'],
                },
              },
              ...matchQuery,
            ],
            filter: filters,
          },
        },
        from,
        size,
      },
    });

    const { hits, total } = resp.body.hits;
    return {
      data: hits.map((item) => item._source),
      count: countResponse.body.count,
      totalRecords: total.value,
    };
  }

  private async getLearningTracks({
    query,
    from,
    size,
    myLearningTrackIds,
    skipDetails = false,
    hasEmptyAssignedLearningTrack = false,
  }: {
    query: SearchQueryDto;
    myLearningTrackIds: string[];
    skipDetails: boolean;
    from: number;
    size: number;
    hasEmptyAssignedLearningTrack: boolean;
  }) {
    let filters: any[] = [];

    if (query.myLearningTrack === '1' && myLearningTrackIds.length < 1) {
      return { count: 0, data: [] };
    }

    if (query.learningTrackAssignmentType && hasEmptyAssignedLearningTrack) {
      return { count: 0, data: [] };
    }

    if (myLearningTrackIds.length > 0) {
      filters = [
        {
          ids: {
            values: myLearningTrackIds,
          },
        },
      ];
    }

    const countResponse =
      await this.elasticsearchService.count<ISearchCountResult>({
        index: this.learningTrackIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: query.term,
                    fuzziness: 'AUTO',
                    minimum_should_match: '20%',
                    fields: ['titleEn', 'titleTh'],
                  },
                },
              ],
              should: [
                // TODO: Check and allow private learning tracks
                ...[].map((id) => ({
                  match: { id },
                })),
                { term: { isPublic: true } },
              ],
              minimum_should_match: 1,
              filter: filters,
            },
          },
        },
      });

    if (skipDetails) {
      return {
        count: countResponse.body.count,
        data: [],
      };
    }

    const resp = await this.elasticsearchService.search<ISearchResult>({
      index: this.learningTrackIndex,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.term,
                  fuzziness: 'AUTO',
                  minimum_should_match: '20%',
                  fields: ['titleEn', 'titleTh'],
                },
              },
            ],
            should: [
              // TODO: Check and allow private learning tracks
              ...[].map((id) => ({
                match: { id },
              })),
              { term: { isPublic: true } },
            ],
            minimum_should_match: 1,
            filter: filters,
          },
        },
        from,
        size,
      },
    });

    const { hits, total } = resp.body.hits;
    return {
      data: hits.map((item) => item._source),
      count: countResponse.body.count,
      totalRecords: total.value,
    };
  }

  private async getInstructors({
    query,
    from,
    size,
    skipDetails = false,
  }: {
    query: SearchQueryDto;
    skipDetails: boolean;
    from: number;
    size: number;
  }) {
    const filters: any[] = [
      {
        term: {
          isActive: true,
        },
      },
      {
        term: {
          isActivated: true,
        },
      },
    ];

    const countResponse =
      await this.elasticsearchService.count<ISearchCountResult>({
        index: this.instructorIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query: query.term,
                    fuzziness: 'AUTO',
                    minimum_should_match: '20%',
                    fields: ['firstName', 'lastName', 'email'],
                  },
                },
              ],
              filter: filters,
            },
          },
        },
      });

    if (skipDetails) {
      return {
        count: countResponse.body.count,
        data: [],
        totalRecords: 0,
      };
    }

    const resp = await this.elasticsearchService.search<ISearchResult>({
      index: this.instructorIndex,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.term,
                  fuzziness: 'AUTO',
                  fields: ['firstName', 'lastName', 'email'],
                },
              },
            ],
            filter: filters,
          },
        },
        from,
        size,
      },
    });

    const { hits, total } = resp.body.hits;
    return {
      data: hits.map((item) => item._source),
      count: countResponse.body.count,
      totalRecords: total.value,
    };
  }

  private mapInstructorSearchResponse(
    searchResult: {
      data: Partial<User>[] | [];
      count: number;
      totalRecords: any;
    },
    dbResult: User[],
  ) {
    return {
      ...searchResult,
      data: searchResult.data.map((sr) => {
        const courseSessionInstructors = dbResult.find(
          (dbr) => dbr.id === sr.id,
        )?.courseSessionInstructors;
        const todayUTC = dateToUTCDate(new Date());
        const afterThreeMonthsUTC = dateToUTCDate(addMonths(new Date(), 3));

        const filteredCourseSessionInstructors =
          courseSessionInstructors?.filter(
            (csi) =>
              isAfter(csi.courseSession.startDateTime, todayUTC) &&
              isBefore(csi.courseSession.startDateTime, afterThreeMonthsUTC),
          );

        const totalCourses = filteredCourseSessionInstructors
          ? uniqBy(
              filteredCourseSessionInstructors.map(
                (csi) => csi.courseSession.courseOutline.course,
              ),
              'id',
            ).length
          : 0;
        return {
          ...sr,
          totalCourses,
        };
      }),
    };
  }

  private mapCoursesSearchResponse(
    searchResult: {
      data: Partial<Course>[] | [];
      count: number;
      totalRecords?: any;
    },
    dbResult: Course[],
    userEnrolledCourses?: UserEnrolledCourse[],
  ) {
    return {
      ...searchResult,
      data: searchResult.data.map((sr) => {
        const dbCourse = dbResult.find((dbr) => dbr.id === sr.id);
        const enrolledCourse = userEnrolledCourses?.find(
          (uec) => uec.course.id === sr.id,
        );

        return {
          ...sr,
          userAssignedCourse: dbCourse?.userAssignedCourse,
          imageKey: dbCourse?.imageKey,
          durationMonths: dbCourse?.durationMonths,
          durationWeeks: dbCourse?.durationWeeks,
          durationDays: dbCourse?.durationDays,
          durationHours: dbCourse?.durationHours,
          durationMinutes: dbCourse?.durationMinutes,
          progressPercentage: enrolledCourse?.percentage,
        };
      }),
    };
  }

  private mapLTSearchResponse(
    searchResult: {
      data: Partial<LearningTrack>[] | [];
      count: number;
      totalRecords?: any;
    },
    dbResult: LearningTrack[],
  ) {
    return {
      ...searchResult,
      data: searchResult.data.map((sr) => {
        const dbLearningTrack = dbResult.find((dbr) => dbr.id === sr.id);

        return {
          ...sr,
          userAssignedLearningTrack: dbLearningTrack?.userAssignedLearningTrack,
        };
      }),
    };
  }
}
