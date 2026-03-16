import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoggleResponse {
  board: string[][];
  words: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BoggleService {

  private API = "https://boggle-backend.onrender.com/generate-board";

  constructor(private http: HttpClient) {}

  getBoard(size: number): Observable<BoggleResponse> {
    return this.http.get<BoggleResponse>(`${this.API}?size=${size}`);
  }
}