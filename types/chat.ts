export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatResponse {
  reply: string;
}

export interface ChatRequest {
  message: string;
}