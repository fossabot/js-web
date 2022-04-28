import { DeepPartial, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import mockedPlans from '../assets/mock-plans.json';
import { LoginSetting } from '../admin/Login.setting.entity';
import { PasswordSetting } from '../admin/Password.setting.entity';
import { Organization } from '../organization/Organization.entity';
import {
  DurationInterval,
  ExternalPackageProviderType,
  InstancyPackageType,
  SubscriptionPlan,
  SubscriptionPlanCategory,
} from '../payment/SubscriptionPlan.entity';
import {
  CourseCategory,
  CourseCategoryKey,
} from '../course/CourseCategory.entity';
import { ProductItemRaw } from '../raw-product/ProductItemRaw.entity';
import { CatalogMenu } from '../catalog-menu/CatalogMenu.entity';
import {
  CourseSubCategory,
  CourseSubCategoryKey,
} from '../course/CourseSubCategory.entity';
import { Language } from '../language/Language.entity';
import {
  LearningWay,
  LearningWayKey,
} from '../learning-way/LearningWay.entity';
import { CatalogMenuLearningWay } from '../catalog-menu/CatalogMenuLearningWay.entity';
import { ProductArRaw } from '../raw-product/ProductArRaw.entity';
import { Topic } from '../topic/Topic.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(LoginSetting)
    private loginSettingRepository: Repository<LoginSetting>,
    @InjectRepository(PasswordSetting)
    private passwordSettingRepository: Repository<PasswordSetting>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(ProductItemRaw)
    private productItemRawRepository: Repository<ProductItemRaw>,
    @InjectRepository(CatalogMenu)
    private catalogMenuRepository: Repository<CatalogMenu>,
    @InjectRepository(CatalogMenuLearningWay)
    private catalogMenuLearningWayRepository: Repository<CatalogMenuLearningWay>,
    @InjectRepository(CourseCategory)
    private courseCategoryRepository: Repository<CourseCategory>,
    @InjectRepository(CourseSubCategory)
    private courseSubCategoryRepository: Repository<CourseSubCategory>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(LearningWay)
    private learningWayRepository: Repository<LearningWay>,
    @InjectRepository(ProductArRaw)
    private productArRawRepository: Repository<ProductArRaw>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async createLoginSetting() {
    const setting = await this.loginSettingRepository.findOne();
    if (setting) {
      return;
    }

    const newSetting = new LoginSetting();
    newSetting.maxAttempts = 3;
    newSetting.lockDuration = 30 * 60;
    await this.loginSettingRepository.save(newSetting);
  }

  async createPasswordSetting() {
    const setting = await this.passwordSettingRepository.findOne();
    if (setting) {
      return;
    }

    const newSetting = this.passwordSettingRepository.create();
    newSetting.expireIn = 30;
    newSetting.notifyIn = 7;
    await this.passwordSettingRepository.save(newSetting);
  }

  async createMockedPlans() {
    const existingPlan = await this.subscriptionPlanRepository.findOne();

    if (existingPlan) {
      return;
    }

    const mappedPlans = mockedPlans.map((plan) => {
      const mappedPlan: DeepPartial<SubscriptionPlan> = {
        ...plan,
        packageType: plan.packageType as InstancyPackageType,
        externalProviderType:
          plan.externalProviderType as ExternalPackageProviderType,
        category: plan.category as SubscriptionPlanCategory,
        durationInterval: plan.durationInterval as DurationInterval,
        productSKU: this.productArRawRepository.create({
          productGroup: '',
          subProductGroup: '',
          partner: '',
          deliveryFormat: '',
          itemCategory: '',
          no: plan.productId,
          description: '',
          periodDay: plan.periodDay,
          periodMonth: plan.periodMonth,
          periodYear: plan.periodYear,
          baseUnitOfMeasure: '',
          currency: plan.currency,
          countryRegionOfOriginCode: '',
          productAvailability: '',
          shelfLife: '',
          revenueType: '',
          thirdPartyLicenseFee: '',
        }),
      };

      return this.subscriptionPlanRepository.create(mappedPlan);
    });

    await this.subscriptionPlanRepository
      .createQueryBuilder()
      .insert()
      .values(mappedPlans)
      .onConflict('("productId") DO NOTHING')
      .execute();
  }

  async createCourseCategoriesSubCategories() {
    const courseCategory = await this.courseCategoryRepository.findOne();

    if (courseCategory) {
      return;
    }

    const courseCategories = this.courseCategoryRepository.create([
      {
        name: 'Learning Event',
        key: CourseCategoryKey.LEARNING_EVENT,
        courseSubCategory: this.courseSubCategoryRepository.create([
          { name: 'Face to Face', key: CourseSubCategoryKey.FACE_TO_FACE },
          { name: 'Virtual', key: CourseSubCategoryKey.VIRTUAL },
        ]),
      },
      {
        name: 'Online Learning',
        key: CourseCategoryKey.ONLINE_LEARNING,
        courseSubCategory: this.courseSubCategoryRepository.create([
          { name: 'Scorm', key: CourseSubCategoryKey.SCORM },
          { name: 'XAPI', key: CourseSubCategoryKey.XAPI },
          { name: 'Video', key: CourseSubCategoryKey.VIDEO },
          { name: 'Audio', key: CourseSubCategoryKey.AUDIO },
          { name: 'Link', key: CourseSubCategoryKey.LINK },
        ]),
      },
      {
        name: 'Assessment',
        key: CourseCategoryKey.ASSESSMENT,
        courseSubCategory: this.courseSubCategoryRepository.create([
          {
            name: 'SEAC Assessment Center',
            key: CourseSubCategoryKey.ASSESSMENT,
          },
          { name: 'Quiz', key: CourseSubCategoryKey.QUIZ },
          { name: 'Survey', key: CourseSubCategoryKey.SURVEY },
        ]),
      },
      {
        name: 'Material',
        key: CourseCategoryKey.MATERIAL,
        courseSubCategory: this.courseSubCategoryRepository.create([
          { name: 'Document', key: CourseSubCategoryKey.DOCUMENT },
          { name: 'Picture', key: CourseSubCategoryKey.PICTURE },
        ]),
      },
    ]);

    await this.courseCategoryRepository.save(courseCategories);
  }

  async createMockedProductItemRaw() {
    const productItem = await this.productItemRawRepository.findOne();
    if (productItem) {
      return;
    }

    await this.productItemRawRepository.save({
      code: 'BL01-04-11-00001',
      name: 'Virtual BeeLine: Managing Difficult Times & Building Resilience',
      scheduleType: 'Public',
      language: 'en',
    });
  }

  async createRootLearningWays() {
    const topLevelLearningWay = await this.learningWayRepository.findOne({
      key: Not(IsNull()),
    });
    if (topLevelLearningWay) return;

    const learningWays = [
      this.learningWayRepository.create({
        key: LearningWayKey.BEELINE,
        name: 'BeeLine',
        description:
          'Exchange experience with specialized experts in various fields',
        isActive: true,
      }),
      this.learningWayRepository.create({
        key: LearningWayKey.FRONTLINE,
        name: 'FrontLine',
        description:
          'Self-learning with knowledge base that you can download unlimited',
        isActive: true,
      }),
      this.learningWayRepository.create({
        key: LearningWayKey.ONLINE,
        name: 'OnLine',
        description:
          'Self-learning online courses that can answer your questions for 24 hours',
        isActive: true,
      }),
      this.learningWayRepository.create({
        key: LearningWayKey.INLINE,
        name: 'InLine',
        description:
          'Face-to-Face or Virtual Courses that take only half-day per course',
        isActive: true,
      }),
    ];

    await this.learningWayRepository.save(learningWays);
  }

  async createMainCatalogMenu() {
    const mainMenu = await this.catalogMenuRepository.findOne({
      isActive: true,
    });
    if (mainMenu) return;

    const topicHeadline = await this.languageRepository.save({
      nameEn: 'Browse by topics',
      nameTh: 'เรียกดูตามหัวข้อ',
    });
    const learningWayHeadline = await this.languageRepository.save({
      nameEn: '4Line Learning™',
      nameTh: '4Line Learning™',
    });

    const menu = await this.catalogMenuRepository.save({
      topicHeadline,
      learningWayHeadline,
      isActive: true,
    });

    const topLevelLearningWays = await this.learningWayRepository.find({
      where: { key: Not(IsNull()) },
      order: { createdAt: 'ASC' },
    });
    if (topLevelLearningWays && topLevelLearningWays.length) {
      const learningWayItems = topLevelLearningWays.map(
        (learningWay, sequence) => {
          return this.catalogMenuLearningWayRepository.create({
            menu,
            learningWay,
            sequence,
          });
        },
      );
      await this.catalogMenuLearningWayRepository.save(learningWayItems);
    }
  }

  async createMockTopic() {
    const topic = await this.topicRepository.findOne();

    if (topic) return;

    await this.topicRepository.save({
      name: 'Agility Mindset and Methods',
      description:
        'Quisque eu est turpis. Suspendisse ut blandit lorem, aliquam dapibus felis. In posuere cursus felis, in ultrices metus mattis ac.',
    });
  }

  async createMockOrganization() {
    const organization = await this.organizationRepository.findOne();

    if (organization) return;

    await this.organizationRepository.save({
      name: 'Fake Organization',
      slug: 'forg',
    });
  }
}
