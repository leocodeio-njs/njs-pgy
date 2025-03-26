import { Discussion } from '../models/discussion';

export abstract class IDiscussionRepository {
  abstract findAll(): Promise<Discussion[]>;
  abstract findOne(id: string): Promise<Discussion>;
  abstract findByUserId(user_id: string): Promise<Discussion[]>;
  abstract save(discussion: Discussion): Promise<Discussion>;
  abstract delete(id: string): Promise<void>;
}
