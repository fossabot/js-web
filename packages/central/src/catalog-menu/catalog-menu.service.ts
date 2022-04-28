import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CatalogMenu } from '@seaccentral/core/dist/catalog-menu/CatalogMenu.entity';
import { TransactionFor } from '@seaccentral/core/dist/utils/withTransaction';
import { ModuleRef } from '@nestjs/core';
import { Repository } from 'typeorm';
import { CatalogMenuTopic } from '@seaccentral/core/dist/catalog-menu/CatalogMenuTopic.entity';
import { CatalogMenuLearningWay } from '@seaccentral/core/dist/catalog-menu/CatalogMenuLearningWay.entity';
import { Language } from '@seaccentral/core/dist/language/Language.entity';
import { SaveCatalogMenuDto } from './dto/SaveCatalogMenu.dto';

@Injectable()
export class CatalogMenuService extends TransactionFor<CatalogMenuService> {
  constructor(
    @InjectRepository(CatalogMenu)
    private menuRepository: Repository<CatalogMenu>,
    @InjectRepository(CatalogMenuTopic)
    private menuTopicRepository: Repository<CatalogMenuTopic>,
    @InjectRepository(CatalogMenuLearningWay)
    private menuLearningWayRepository: Repository<CatalogMenuLearningWay>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    moduleRef: ModuleRef,
  ) {
    super(moduleRef);
  }

  getMainMenuAndItems() {
    return this.getMainMenu();
  }

  async saveCatalogMenu(dto: SaveCatalogMenuDto) {
    const menu = await this.getMainMenu();
    menu.topicHeadline.nameEn = dto.topicHeadlineEn;
    menu.topicHeadline.nameTh = dto.topicHeadlineTh;
    menu.learningWayHeadline.nameEn = dto.learningWayHeadlineEn;
    menu.learningWayHeadline.nameTh = dto.learningWayHeadlineTh;
    await this.languageRepository.save(menu.topicHeadline);
    await this.languageRepository.save(menu.learningWayHeadline);
    await this.menuRepository.save(menu);

    await this.menuTopicRepository.delete({ menu });
    const menuTopics = dto.topics.map((id, sequence) =>
      this.menuTopicRepository.create({
        menu,
        topic: { id },
        sequence,
        isActive: true,
      }),
    );
    await this.menuTopicRepository.save(menuTopics);

    let menuLearningWays = await this.menuLearningWayRepository.find({ menu });
    menuLearningWays = dto.learningWays.map((id, sequence) => {
      let menuItem = menuLearningWays.find((it) => it.learningWay.id === id);
      if (menuItem) {
        menuItem.sequence = sequence;
      } else {
        menuItem = this.menuLearningWayRepository.create({
          menu,
          learningWay: { id },
          sequence,
          isActive: true,
        });
      }
      return menuItem;
    });
    await this.menuLearningWayRepository.save(menuLearningWays);
  }

  async getMainMenu() {
    const menu = await this.menuRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
      relations: ['menuTopics', 'menuLearningWays'],
    });
    if (!menu)
      throw new HttpException(
        'Main catalog menu not found. Please make sure that you apply the latest migration.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return menu;
  }
}
