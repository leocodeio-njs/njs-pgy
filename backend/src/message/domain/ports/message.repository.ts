import { Message } from '../models/message';

export abstract class IMessageRepository {
  abstract findAll(): Promise<Message[]>;
  abstract findOne(id: string): Promise<Message>;
  abstract findByDiscussionId(discussion_id: string): Promise<Message[]>;
  abstract save(message: Message): Promise<Message>;
  abstract delete(id: string): Promise<void>;
}
