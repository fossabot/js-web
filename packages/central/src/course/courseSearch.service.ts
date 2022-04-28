import { flatten } from 'lodash';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestParams } from '@elastic/elasticsearch';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { Course } from '@seaccentral/core/dist/course/Course.entity';
import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { CourseLanguage } from '@seaccentral/core/dist/course/courseLanguage.enum';

import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { CourseService } from './course.service';
import { CourseSearchResult } from './interface/CourseSearchResult';

@Injectable()
export class CourseSearchService {
  private index = 'courses';

  private type = 'course';

  private logger = new Logger(CourseSearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
  ) {}

  async indexCourse(course: Course) {
    const res = await this.bulkIndexCourses([course]);
    return res;
  }

  async removeIndex(courseId: string) {
    const res = await this.elasticsearchService.deleteByQuery({
      index: this.index,
      type: this.type,
      body: {
        query: {
          match: {
            id: courseId,
          },
        },
      },
    });
    this.checkErrorFromApiResponse(res);
    return res;
  }

  async updateCourseCertificates(hasCertificate: boolean, ids?: string[]) {
    const options: RequestParams.UpdateByQuery = {
      index: this.index,
      refresh: true,
      body: {
        query: ids?.length
          ? {
              ids: {
                values: ids,
              },
            }
          : undefined,
        script: `ctx._source.hasCertificate = ${hasCertificate};`,
      },
    };

    return this.elasticsearchService
      .updateByQuery(options)
      .catch((error) =>
        this.logger.error(
          'Error while updating course hasCertificate attribute.',
          error,
        ),
      );
  }

  async isIndexExists() {
    const courseIndex = await this.elasticsearchService.indices
      .get({ index: this.index })
      .catch((e) => this.logger.log(`Index ${this.index} not found.`, e));

    return !!courseIndex;
  }

  async reindex() {
    const existingIndex = await this.isIndexExists();

    if (existingIndex) {
      await this.elasticsearchService.indices.delete({ index: this.index });
    }

    await this.createIndex();
    const allCourses = await this.getAllCourses([], 1);
    await this.bulkIndexCourses(allCourses);
  }

  async createIndex() {
    await this.elasticsearchService.indices.create({
      index: this.index,
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
                max_gram: 20,
                token_chars: ['letter', 'digit'],
              },
            },
          },
        },
        mappings: {
          properties: {
            categoryId: { type: 'text' },
            categoryKey: { type: 'text' },
            categoryName: { type: 'text' },
            createdAt: { type: 'date' },
            duration: { type: 'long' },
            id: { type: 'text' },
            language: { type: 'text' },
            learningWayIds: { type: 'text' },
            learningWayNames: { type: 'text' },
            subCategoryKeys: { type: 'text' },
            title: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
            },
            titleEn: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
            },
            titleTh: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
            },
            topicIds: { type: 'text' },
            topicNames: { type: 'text' },
            hasCertificate: { type: 'boolean' },
          },
        },
      },
    });
  }

  async getAllCourses(coursesArr: Course[], page = 1): Promise<Course[]> {
    const take = 1000;
    const skip = page > 1 ? take * (page - 1) : 0;

    const courses = await this.courseService.findAll({
      skip,
      take,
      search: '',
      searchField: '',
      order: 'DESC',
      orderBy: 'title',
    });

    const coursesToPush = courses.data.filter(
      (c) => c.isActive && c.status === CourseStatus.Published,
    );

    if (coursesToPush.length < 1) return coursesArr;

    coursesArr = coursesArr.concat(coursesToPush);
    return this.getAllCourses(coursesArr, page + 1);
  }

  async bulkIndexCourses(courses: Course[]) {
    const existingIndex = await this.isIndexExists();

    if (!existingIndex) {
      await this.createIndex();
    }

    const courseIds = courses.map((it) => it.id);
    const hasCertificateMap = await this.courseService.getCertificateMap(
      courseIds,
    );

    const body = flatten(
      courses.map((course) => {
        return [
          {
            index: {
              _index: this.index,
              _id: course.id,
            },
          },
          {
            id: course.id,
            title: getStringFromLanguage(course.title, LanguageCode.EN),
            titleEn: getStringFromLanguage(course.title, LanguageCode.EN),
            titleTh: getStringFromLanguage(course.title, LanguageCode.TH),
            language: course.availableLanguage,
            duration:
              course.durationMinutes +
              course.durationHours * 60 +
              course.durationDays * 24 * 60 +
              course.durationWeeks * 7 * 24 * 60 +
              course.durationMonths * 30 * 24 * 60,
            categoryId: course.category.id,
            categoryKey: course.category.key,
            categoryName: course.category.name,
            subCategoryKeys: course.courseOutline
              ?.map((co) => co.category.key)
              .filter((key, index, arr) => arr.indexOf(key) === index),
            topicIds: course.courseTopic.map((ct) => ct.topic.id),
            topicNames: course.courseTopic.map((ct) => ct.topic.name),
            learningWayIds: course.courseOutline.map((co) => co.learningWay.id),
            learningWayNames: course.courseOutline.map(
              (co) => co.learningWay.name,
            ),
            createdAt: course.createdAt,
            hasCertificate: hasCertificateMap.get(course.id) || false,
          },
        ];
      }),
    );

    const res = await this.elasticsearchService
      .bulk({
        index: this.index,
        refresh: true,
        body,
      })
      .catch((error) =>
        this.logger.error('Error bulk inserting courses', error),
      );

    this.checkErrorFromApiResponse(res);
  }

  async search(
    id: string | string[],
    type: string,
    language: string,
    durationStart: number,
    durationEnd: number,
    categoryKey: string,
    subCategoryKey: string,
    from: number,
    size: number,
    filterIds?: string[],
    hasCertificate?: boolean,
  ) {
    const filters: any[] = [];

    if (filterIds && filterIds.length > 0) {
      filters.push({
        ids: {
          values: filterIds,
        },
      });
    }

    const searchField = type === 'topic' ? 'topicIds' : 'learningWayIds';
    const query: any = [{ match: { [searchField]: id } }];
    if (language !== CourseLanguage.ALL) {
      query.push({
        match: {
          language,
        },
      });
    }
    if (categoryKey) {
      query.push({
        match: {
          categoryKey,
        },
      });
    }
    if (subCategoryKey) {
      query.push({
        match: {
          subCategoryKeys: subCategoryKey,
        },
      });
    }
    if (durationStart && durationEnd) {
      query.push({
        range: {
          duration: {
            gte: durationStart,
            lte: durationEnd,
          },
        },
      });
    } else if (durationStart) {
      query.push({
        range: {
          duration: {
            gte: durationStart,
          },
        },
      });
    } else if (durationEnd) {
      query.push({
        range: {
          duration: {
            lte: durationEnd,
          },
        },
      });
    }
    if (hasCertificate) {
      query.push({
        match: {
          hasCertificate,
        },
      });
    }
    const { body } = await this.elasticsearchService.search<CourseSearchResult>(
      {
        index: this.index,
        body: {
          query: {
            bool: {
              must: query,
              filter: filters,
            },
          },
          from,
          size,
          sort: {
            createdAt: { order: 'desc' },
          },
        },
      },
    );

    const { total, hits } = body.hits;
    return { data: hits.map((item) => item._source), total: total.value };
  }

  checkErrorFromApiResponse(res: any) {
    if (res.body.errors) {
      this.logger.error(res.body);
    }
  }
}
