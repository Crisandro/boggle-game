import { inject, Injectable, NgZone, signal, WritableSignal } from "@angular/core";
import { SessionStorageService } from "./sessionStorage.service";
import { SessionStorageKeys } from "../enums/sessionStorageKeys.enum";
import { Subscription, timer } from "rxjs";
import { LeaderBoardService } from "./leaderBoard.service";

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private sessionStorageService = inject(SessionStorageService);
  protected leaderBoard = inject(LeaderBoardService);
  public secondsLeft: WritableSignal<number>;
  private countdownSub?: Subscription;

  constructor(
    private zone: NgZone
  ) {
    this.secondsLeft = signal(this.sessionStorageService.getRemainingTime(SessionStorageKeys.GameStart) ?? 0);
    if (this.secondsLeft() > 0) { 
      this.getRemainingTime();
    }
  }

  public timerStart() {
    this.sessionStorageService.setSessionTimer(SessionStorageKeys.GameStart);
  }

  public getRemainingTime() {
    this.zone.runOutsideAngular(() => {
      this.countdownSub = timer(0, 1000).subscribe(() => {
        this.zone.run(() => {
          this.secondsLeft.set(this.sessionStorageService.getRemainingTime(SessionStorageKeys.GameStart) ?? 0);
          if (this.secondsLeft() < 0) {
            this.endTimer();
          }
        });
      });
    });
  }

  public endTimer() {
    this.countdownSub?.unsubscribe();
  }
}