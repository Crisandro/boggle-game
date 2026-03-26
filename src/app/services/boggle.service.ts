import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetBoardResponse, Tile } from '../models/table.model';
import { SessionStorageService } from './sessionStorage.service';
import { SessionStorageKeys } from '../enums/sessionStorageKeys.enum';
import { LoaderService } from './loader.service';
import { BoggleResponse } from '../interface/tile.interface';
import { CryptoService } from './crypto.service';
import { CommonConstant } from '../constant/common.constant';
import { TileService } from './tile.service';
import { TimerService } from './timer.service';

declare global {
  interface Window {
    __env: any;
  }
}
@Injectable({
  providedIn: 'root'
})
export class BoggleService {
  public loaderService = inject(LoaderService);
  public cryptoService = inject(CryptoService);
  public tileService = inject(TileService);
  public timerService = inject(TimerService);
  public currentWord: WritableSignal<string>;
  public selectedTiles: WritableSignal<Array<Tile>>;
  public lastVisitedTile: WritableSignal<Tile | null>;
  public correctWords: WritableSignal<Array<string>>;
  public overAllScore: WritableSignal<number>;
  public boardData: WritableSignal<BoggleResponse>;
  public validWords: WritableSignal<Array<string>>;
  private boggleUrl: string;
  private audio = new Audio();

  constructor(private http: HttpClient, private readonly sessionStorageService: SessionStorageService) {
    this.boggleUrl = window.__env.apiUrl;
    this.boardData = signal<BoggleResponse>(
      this.sessionStorageService.getObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard)
    );
    this.validWords = signal(this.boardData()?.words);
    this.selectedTiles = signal(new Array<Tile>());
    this.lastVisitedTile = signal(null);
    this.currentWord = signal("");
    this.correctWords = signal<Array<string>>(
      this.sessionStorageService.getObjectItem<Array<string>>(SessionStorageKeys.CorrectWords) ?? []
    );
    this.overAllScore = signal(this.getScore());
    this.audio = new Audio(CommonConstant.MP3.BUTTON_SOUND_FX);
  }

  public getBoard(size: number): Observable<GetBoardResponse> {
    return this.http.get<GetBoardResponse>(`${this.boggleUrl}/generate-board?size=${size}`);
  }

  public async loadBoard(size: number, isRestart?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.boardData() || isRestart) {
        this.loaderService.toggleLoader();
        this.getBoard(size).subscribe((boardData: GetBoardResponse) => {
          const boggleResponse: BoggleResponse = this.cryptoService.encryptResponse<BoggleResponse>(boardData.response);
          if (!boggleResponse) reject();
          this.boardData.update((board: BoggleResponse) => board = boggleResponse);
          this.validWords.update(validWords => validWords = this.boardData()?.words);
          this.sessionStorageService.setObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard, boggleResponse);
          this.loaderService.toggleLoader();
          requestAnimationFrame(() => {
            this.tileService.cacheTileElements();
            this.tileService.cacheTileRects();
          });
          resolve();
        });
      }
    })
  }

  public isSelectedTile(tile: Tile): boolean {
    return this.selectedTiles()?.some((position: Tile) => position?.row === tile.row && position?.column === tile.column);
  }

  public addLetter(tile: Tile): void {
    const selectedPositionIndex = this.selectedTiles()?.findIndex((position: Tile) => position?.row === tile?.row && position?.column === tile?.column);
    if (this.isSelectedTile(tile) && !this.isCurrentTile() && selectedPositionIndex !== -1) {
      this.spliceSelectedTile(selectedPositionIndex);
    } else if (!this.isSelectedTile(tile) || !this.selectedTiles().length) {
      this.selectedTiles.update((selectedTiles) => {
        return [...selectedTiles, tile];
      });
      let word = "";
      this.selectedTiles()?.forEach(selectedTiles => word += selectedTiles.letter);
      this.currentWord.update(currentWord => currentWord = word);
      this.playSoundEffect(this.audio);
    }
    this.lastVisitedTile.update((currentTile) => currentTile = tile);
  }

  public playSoundEffect(audio: HTMLAudioElement) {
    audio.currentTime = CommonConstant.NUMERIC.ZERO;
    audio.play().catch(() => {});
  }

  private spliceSelectedTile(selectedPositionIndex: number) {
    this.selectedTiles.update(selectedTiles => {
      const selectedTilesCopy = selectedTiles;
      selectedTilesCopy.splice(selectedPositionIndex)
      return selectedTilesCopy;
    });
  }

  private isCurrentTile(): boolean {
    const selectedTileLength = this.selectedTiles().length - 1;
    const selectedTiles = this.selectedTiles();
    const lastSelectedTile = selectedTiles[selectedTileLength];
    return lastSelectedTile?.row === this.lastVisitedTile()?.row &&
      lastSelectedTile?.column === this.lastVisitedTile()?.column &&
      lastSelectedTile?.letter === this.lastVisitedTile()?.letter;
  }

  public isTileSkip(newTile: Tile): boolean {
    if (this.lastVisitedTile()) {
      const rowDifference = newTile.row - this.lastVisitedTile()!.row;
      const columnDifference = newTile.column - this.lastVisitedTile()!.column;

      const isRowSkip = rowDifference > 1 || rowDifference < -1;
      const isColumnSkip = columnDifference > 1 || columnDifference < -1;
      return isRowSkip || isColumnSkip;
    }
    return false;
  }

  public getScore(word?: string): number {
    let score = 0;
    if (word) {
      score += this.calculateScore(word);
    } else {
      this.correctWords().forEach((correctWord: string) => {
        score += this.calculateScore(correctWord);
      });
    }

    return score;
  }

  private calculateScore(correctWord: string): number {
    const wordLength = correctWord?.length;
    switch(wordLength) {
        case 3:
        case 4:
            return 1;
        case 5:
            return 2;
        case 6:
            return 3;
        case 7:
            return 5;
        case 8:
        default:
            return 11;
    }
  }
}