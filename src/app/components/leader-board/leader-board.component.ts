import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, effect, inject, signal, WritableSignal } from "@angular/core";
import { LeaderBoard } from "../../models/leaderBoard.model";
import { Observable } from "rxjs";
import { LoaderService } from "../../services/loader.service";
import { BoggleService } from "../../services/boggle.service";
import { CommonConstant } from "../../constant/common.constant";
import { SessionStorageService } from "../../services/sessionStorage.service";
import { SessionStorageKeys } from "../../enums/sessionStorageKeys.enum";
import { Tile } from "../../models/table.model";
import { TimerService } from "../../services/timer.service";
import { LeaderBoardService } from "../../services/leaderBoard.service";
import { TileService } from "../../services/tile.service";

@Component({
  selector: 'leader-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.css']
})
export class LeaderBoardComponent {
  private hasFinalized = false;
  private loaderService = inject(LoaderService);
  private sessionStorageService = inject(SessionStorageService);
  protected boggleService = inject(BoggleService);
  protected timerService = inject(TimerService);
  protected tileService = inject(TileService);
  protected leaderBoardsService = inject(LeaderBoardService);
  protected scoreRecorded: WritableSignal<boolean>;
  public leaderBoards: WritableSignal<Array<LeaderBoard>>;
  
  constructor(private http: HttpClient) {
    this.scoreRecorded = signal(this.sessionStorageService.getObjectItem<boolean>(SessionStorageKeys.ScoreRecorded) ?? false);
    this.leaderBoards = signal<Array<LeaderBoard>>(
      this.sessionStorageService.getObjectItem<Array<LeaderBoard>>(SessionStorageKeys.LeaderBoard) ?? []
    );
    effect(() => {
      if (this.timerService.secondsLeft() < 0 && !this.leaderBoards()?.length) {
        setTimeout(() => this.onGameEnd());
      }
    });
  }

  private onGameEnd(): void {
    if (this.hasFinalized || this.scoreRecorded() || this.leaderBoards().length) return;

    this.hasFinalized = true;
    this.loaderService.toggleLoader();
    this.leaderBoardsService.finalizeLeaderBoard().then((leaderBoards: Array<LeaderBoard>)=> {
      this.leaderBoards.set(
        this.leaderBoardsService.determineCurrentScoreRank(
          this.boggleService.overAllScore(),
          this.boggleService.correctWords(),
          leaderBoards
        )
      );
      this.sessionStorageService.setObjectItem<Array<LeaderBoard>>(SessionStorageKeys.LeaderBoard, this.leaderBoards());
      this.loaderService.toggleLoader();
    })
  }

  public saveScore(data: LeaderBoard): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(window.__env.apiUrl + '/save-score', data);
  }

  public async submitScore(): Promise<void> {
    const userData = new LeaderBoard(
      this.leaderBoardsService.userName(),
      this.boggleService.overAllScore(),
      this.leaderBoardsService.getTopThreeWords(this.boggleService.correctWords())
    );
    return new Promise((resolve) => {
      this.loaderService.toggleLoader();
      this.saveScore(userData).subscribe(() => {
        this.scoreRecorded.set(true);
        this.loaderService.toggleLoader();
        this.sessionStorageService.setObjectItem<boolean>(SessionStorageKeys.ScoreRecorded, true);
        this.leaderBoardsService.saveNewLeaderBoard(this.leaderBoards());
        resolve(); 
      });
    })
  }

  protected onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.leaderBoardsService.userName.set(value);
  }

  public startNewGame() {
    this.boggleService.loadBoard(CommonConstant.NUMERIC.SIX, true).then(() => {
      requestAnimationFrame(() => {
        
      });
      this.timerService.timerStart();
      this.timerService.getRemainingTime();
      this.boggleService.selectedTiles = signal(new Array<Tile>());
      this.boggleService.lastVisitedTile = signal(null);
      this.boggleService.currentWord = signal(CommonConstant.STRING.EMPTY_STRING);
      this.boggleService.correctWords = signal<Array<string>>(new Array<string>());
      this.sessionStorageService.setObjectItem<Array<string>>(SessionStorageKeys.CorrectWords, new Array<string>());
      this.boggleService.overAllScore = signal(CommonConstant.NUMERIC.ZERO);
      this.leaderBoards = signal<Array<LeaderBoard>>(new Array<LeaderBoard>());
      this.sessionStorageService.remove(SessionStorageKeys.LeaderBoard);
      this.sessionStorageService.remove(SessionStorageKeys.UserData);
      this.leaderBoardsService.userName.set("");
      this.scoreRecorded.set(false);
      this.sessionStorageService.setObjectItem<boolean>(SessionStorageKeys.ScoreRecorded, false);

      this.hasFinalized = false;
    });
  }
}