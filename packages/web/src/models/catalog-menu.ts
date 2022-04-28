import { Language } from './language';
import { LearningWay } from './learning-way';
import { Topic } from './topic';

export class CatalogMenu {
  topicHeadline: Language;
  learningWayHeadline: Language;
  topics: Topic[];
  learningWays: LearningWay[];
}
