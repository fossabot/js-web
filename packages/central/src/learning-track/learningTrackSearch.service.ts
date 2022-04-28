import { flatten } from 'lodash';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestParams } from '@elastic/elasticsearch';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { CourseStatus } from '@seaccentral/core/dist/course/courseStatus.enum';
import { LearningTrack } from '@seaccentral/core/dist/learning-track/LearningTrack.entity';

import { getStringFromLanguage } from '@seaccentral/core/dist/utils/language';
import { LanguageCode } from '@seaccentral/core/dist/language/Language.entity';
import { LearningTrackService } from './learningTrack.service';
import { LearningTrackSearchResult } from './interface/LearningTrackSearchResult';

@Injectable()
export class LearningTrackSearchService {
  private index = 'learning-tracks';

  private type = 'learning-track';

  private logger = new Logger(LearningTrackSearchService.name);

  constructor(
    @Inject(forwardRef(() => LearningTrackService))
    private readonly learningTrackService: LearningTrackService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async indexLearningTrack(learningTrack: LearningTrack) {
    const res = await this.bulkIndexLearningTracks([learningTrack]);
    return res;
  }

  async removeIndex(learningTrackId: string) {
    const res = await this.elasticsearchService.deleteByQuery({
      index: this.index,
      type: this.type,
      body: {
        query: {
          match: {
            id: learningTrackId,
          },
        },
      },
    });
    this.checkErrorFromApiResponse(res);
    return res;
  }

  async updateLearningTrackCertificates(
    hasCertificate: boolean,
    ids?: string[],
  ) {
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
    const learningTrackIndex = await this.elasticsearchService.indices
      .get({ index: this.index })
      .catch((e) => this.logger.log(`Index ${this.index} not found.`, e));

    return !!learningTrackIndex;
  }

  async reindex() {
    const existingIndex = await this.isIndexExists();

    if (existingIndex) {
      await this.elasticsearchService.indices.delete({ index: this.index });
    }

    await this.createIndex();
    const allLearningTracks = await this.getAllLearningTracks([], 1);
    await this.bulkIndexLearningTracks(allLearningTracks);
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
            isFeatured: { type: 'long' },
            isPublic: { type: 'boolean' },
            topicIds: { type: 'text' },
            topicNames: { type: 'text' },
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
            hasCertificate: {
              type: 'boolean',
            },
          },
        },
      },
    });
  }

  async getAllLearningTracks(
    learningTracksArr: LearningTrack[],
    page = 1,
  ): Promise<LearningTrack[]> {
    const take = 1000;
    const skip = page > 1 ? take * (page - 1) : 0;

    const learningTracks = await this.learningTrackService.findAll({
      skip,
      take,
      search: '',
      searchField: '',
      order: 'DESC',
      orderBy: 'title',
    });

    const learningTracksToPush = learningTracks.data.filter(
      (lt) => lt.isActive && lt.status === CourseStatus.Published,
    );

    if (learningTracksToPush.length < 1) return learningTracksArr;

    learningTracksArr = learningTracksArr.concat(learningTracksToPush);
    return this.getAllLearningTracks(learningTracksArr, page + 1);
  }

  async bulkIndexLearningTracks(learningTracks: LearningTrack[]) {
    const existingIndex = await this.isIndexExists();

    if (!existingIndex) {
      await this.createIndex();
    }

    const learningTrackIds = learningTracks.map((it) => it.id);
    const hasCertificateMap = await this.learningTrackService.getCertificateMap(
      learningTrackIds,
    );

    const body = flatten(
      learningTracks.map((learningTrack) => {
        return [
          {
            index: {
              _index: this.index,
              _id: learningTrack.id,
            },
          },
          {
            id: learningTrack.id,
            title: getStringFromLanguage(learningTrack.title, LanguageCode.EN),
            titleEn: getStringFromLanguage(
              learningTrack.title,
              LanguageCode.EN,
            ),
            titleTh: getStringFromLanguage(
              learningTrack.title,
              LanguageCode.TH,
            ),
            duration:
              learningTrack.durationMinutes +
              learningTrack.durationHours * 60 +
              learningTrack.durationDays * 24 * 60 +
              learningTrack.durationWeeks * 7 * 24 * 60 +
              learningTrack.durationMonths * 30 * 24 * 60,
            categoryId: learningTrack.category.id,
            categoryKey: learningTrack.category.key,
            categoryName: learningTrack.category.name,
            isPublic: learningTrack.isPublic,
            isFeatured: learningTrack.isFeatured ? 1 : 0,
            topicIds: learningTrack.learningTrackTopic.map((ct) => ct.topic.id),
            topicNames: learningTrack.learningTrackTopic.map(
              (ct) => ct.topic.name,
            ),
            createdAt: learningTrack.createdAt,
            hasCertificate: hasCertificateMap.get(learningTrack.id) || false,
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
        this.logger.error('Error bulk inserting learning tracks', error),
      );

    this.checkErrorFromApiResponse(res);
  }

  async search({
    topicIds,
    privateLearningTrackIds = [],
    categoryKeys = [],
    from,
    size,
    hasCertificate,
    filterIds,
  }: {
    topicIds: string | string[];
    privateLearningTrackIds: string[];
    categoryKeys: string[];
    from: number;
    size: number;
    hasCertificate?: boolean;
    filterIds?: string[];
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mustQuery: any = topicIds.length > 0 ? [{ match: { topicIds } }] : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any[] = [];

    if (filterIds && filterIds.length > 0) {
      filters.push({
        ids: {
          values: filterIds,
        },
      });
    }

    if (categoryKeys.length > 0) {
      categoryKeys.forEach((categoryKey) => {
        mustQuery.push({
          match: {
            categoryKey,
          },
        });
      });
    }

    if (hasCertificate) {
      mustQuery.push({
        match: {
          hasCertificate,
        },
      });
    }

    const { body } =
      await this.elasticsearchService.search<LearningTrackSearchResult>({
        index: this.index,
        body: {
          query: {
            bool: {
              must: mustQuery,
              should: [
                ...privateLearningTrackIds.map((id) => ({
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
          sort: {
            isFeatured: { order: 'desc' },
            createdAt: { order: 'desc' },
          },
        },
      });

    const { total, hits } = body.hits;
    return { data: hits.map((item) => item._source), total: total.value };
  }

  checkErrorFromApiResponse(res: any) {
    if (res.body.errors) {
      this.logger.error(res.body);
    }
  }
}
