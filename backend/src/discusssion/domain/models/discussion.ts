export interface Discussion {
  id: string;
  user_id: string;
  title: string;
  type: string;
  isPinned: boolean;
  participants: {
    id: string;
    name: string;
  }[];
  created_at: Date;
  updated_at: Date;
}
