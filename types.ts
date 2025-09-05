
export enum MessageSender {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
}

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
}
