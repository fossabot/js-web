import { Base } from './base';
import { Language } from './language';

export interface ISystemAnnouncement extends Base {
  title?: Language;

  message?: Language;

  messageStartDateTime?: Date | null;

  messageEndDateTime?: Date | null;

  startDate: Date;

  endDate: Date;

  imageKey?: string | null;
}
