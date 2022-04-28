import { MessageType } from './constants';

export interface MessageEventData {
  type: MessageType;
  url: string;
  auth: string;
  userId: string;
}
