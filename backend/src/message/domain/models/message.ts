export interface Message {
  id: string;
  discussionId: string;
  sender: {
    id: string;
    name: string;
  };
  messageContent: {
    type: 'text' | 'image' | 'video';
    content: string;
  }[];
  time: string;
  date: string;
  share: {
    twit: string;
  };
  created_at: Date;
  updated_at: Date;
}
