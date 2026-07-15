import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiGeminiResponse {
  mode?: string; // "recommend", "risk", or "text"
  recommendedResources?: {
    employee: string;
    available: number;
  }[];
  risk?: string[];
  text?: string; // natural text answer
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:8080/ai';

  constructor(private http: HttpClient) {}

  askGemini(prompt: string): Observable<AiGeminiResponse> {
    return this.http.post<AiGeminiResponse>(`${this.apiUrl}/gemini`, { prompt });
  }
}
