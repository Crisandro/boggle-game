import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { LeaderBoard, UserData } from "../models/leaderBoard.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SessionStorageService } from "./sessionStorage.service";
import { SessionStorageKeys } from "../enums/sessionStorageKeys.enum";

@Injectable({
  providedIn: 'root'
})
export class LeaderBoardService {
  public userName: WritableSignal<string>;
  public currentRank: WritableSignal<number>;
  private sessionStorageService = inject(SessionStorageService);
  
  constructor(
    private http: HttpClient
  ) {
    this.userName = signal<string>(
      this.sessionStorageService.getObjectItem<UserData>(SessionStorageKeys.UserData)?.name ?? ""
    );
    this.currentRank = signal<number>(
      this.sessionStorageService.getObjectItem<UserData>(SessionStorageKeys.UserData)?.currentRank
    );
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

    const userData = new LeaderBoard(this.userName(), overallScore, this.getTopThreeWords(correctWords));
    this.sessionStorageService.setObjectItem<UserData>(
      SessionStorageKeys.UserData,
      new UserData(this.userName(), this.currentRank(), this.getTopThreeWords(correctWords), overallScore)
    );
    if (this.currentRank() < 10) {
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

  public saveNewLeaderBoard(leaderBoard: Array<LeaderBoard>): void {
    const userData: UserData = this.sessionStorageService.getObjectItem<UserData>(SessionStorageKeys.UserData);
    leaderBoard[this.currentRank()].name = this.userName() ?? "";
    leaderBoard[this.currentRank()].score = userData?.overAllScore ?? 0;
    leaderBoard[this.currentRank()].words = userData?.topWords ?? [];
    this.sessionStorageService.setObjectItem<Array<LeaderBoard>>(SessionStorageKeys.LeaderBoard, leaderBoard);
  }
}