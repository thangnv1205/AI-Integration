import { Observable } from 'rxjs';

export interface AiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AiProvider {
  name: string;
  generateResponse(prompt: string, options?: any): Promise<AiResponse>;
  generateStream(prompt: string, options?: any): Observable<string>;
}
