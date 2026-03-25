import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { CommonConstant } from "../../constant/common.constant";
import { TileService } from "../../services/tile.service";
import { BoggleService } from "../../services/boggle.service";
import { Tile } from "../../models/table.model";
import { SessionStorageService } from "../../services/sessionStorage.service";
import { SessionStorageKeys } from "../../enums/sessionStorageKeys.enum";
import { TimerService } from "../../services/timer.service";

@Component({
  selector: 'main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  private tileService = inject(TileService);
  private boggleService = inject(BoggleService);
  private timerService = inject(TimerService);
  private sessionStorageService = inject(SessionStorageService);
  protected openMenu: boolean;

  constructor() {
    this.openMenu = !Boolean(this.boggleService.boardData());
  }

  public startNewGame() {
    this.boggleService.loadBoard(CommonConstant.NUMERIC.SIX, true).then(() =>{
        requestAnimationFrame(() => {
          this.tileService.cacheTileElements();
          this.tileService.cacheTileRects();
        });
        this.timerService.timerStart();
        this.timerService.getRemainingTime();
    });
    this.boggleService.selectedTiles = signal(new Array<Tile>());
    this.boggleService.lastVisitedTile = signal(null);
    this.boggleService.currentWord = signal(CommonConstant.STRING.EMPTY_STRING);
    this.boggleService.correctWords = signal<Array<string>>(new Array<string>());
    this.sessionStorageService.setObjectItem<Array<string>>(SessionStorageKeys.CorrectWords, new Array<string>());
    this.boggleService.overAllScore = signal(CommonConstant.NUMERIC.ZERO);
  }

  public toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}