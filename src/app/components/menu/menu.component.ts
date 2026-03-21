import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { SIX } from "../../constant/common.constant";
import { TileService } from "../../services/tile.service";
import { BoggleService } from "../../services/boggle.service";
import { Tile } from "../../models/table.model";
import { SessionStorageService } from "../../services/sessionStorage.service";
import { SessionStorageKeys } from "../../enums/sessionStorageKeys.enum";

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
  private sessionStorageService = inject(SessionStorageService);
  protected openMenu: boolean;

  constructor() {
    this.openMenu = false;
  }

  public restartGame() {
    this.boggleService.loadBoard(SIX, true).then(() =>{
        setTimeout(() => this.tileService.cacheTileRects(), 1000);
    });
    this.boggleService.selectedTiles = signal(new Array<Tile>());
    this.boggleService.lastVisitedTile = signal(null);
    this.boggleService.currentWord = signal("");
    this.boggleService.correctWords = signal<Array<string>>(new Array<string>());
    this.sessionStorageService.setObjectItem<Array<string>>(SessionStorageKeys.CorrectWords, new Array<string>());
    this.boggleService.overAllScore = signal(0);
  }

  public toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}