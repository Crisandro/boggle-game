import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { LoaderService } from "./loader.service";
import { BoggleService } from "./boggle.service";
import { LeaderBoard } from "../models/leaderBoard.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LeaderBoardService {
  public userName: WritableSignal<string>;
  public currentRank: WritableSignal<number>;
  
  constructor(
    private http: HttpClient
  ) {
    this.userName = signal<string>("");
    this.currentRank = signal(0);
    
  }

  public getLeaderBoard(): Observable<Array<LeaderBoard>> {
    return this.http.get<Array<LeaderBoard>>(window.__env.apiUrl + "/leaderboard");
  }

  public async finalizeLeaderBoard(): Promise<Array<LeaderBoard>> {
    return new Promise((resolve) => {
      this.getLeaderBoard().subscribe((leaderBoards: Array<LeaderBoard>) => {
        resolve(leaderBoards);
      });
    })
  }

  public determineCurrentScoreRank(
    overallScore: number,
    correctWords: Array<string>,
    leaderBoard: Array<LeaderBoard>
  ): Array<LeaderBoard> {
    this.currentRank.set(0);
    leaderBoard.forEach((leaderBoard: LeaderBoard, scoreIndex: number) => {
      if (overallScore <= leaderBoard.score) {
        this.currentRank.set(scoreIndex + 1);
      }
    });

    if (this.currentRank() < 10) {
      const userData = new LeaderBoard(this.userName(), overallScore, this.getTopThreeWords(correctWords));
      leaderBoard.length > this.currentRank() ?
        leaderBoard.splice(this.currentRank(), 0, userData) :
        leaderBoard.push(userData);
      if (leaderBoard.length > 10) {
        leaderBoard.pop();
      }
    }

    return leaderBoard;
  }

  public getTopThreeWords(correctWords: Array<string>): Array<string> {
    correctWords.sort((a,b) => a.length - b.length);
    return correctWords.slice(-3);
  }
}