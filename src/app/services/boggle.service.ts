import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tile } from '../models/table.model';
import { SessionStorageService } from './sessionStorage.service';
import { SessionStorageKeys } from '../enums/sessionStorageKeys.enum';
import { LoaderService } from './loader.service';

export interface BoggleResponse {
  board: string[][];
  words: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BoggleService {
  public loaderService = inject(LoaderService);
  public currentWord: WritableSignal<string>;
  public selectedTiles: WritableSignal<Array<Tile>>;
  public lastVisitedTile: WritableSignal<Tile | null>;
  public correctWords: WritableSignal<Array<string>>;
  public overAllScore: WritableSignal<number>;
  public boardData: WritableSignal<BoggleResponse>;
  public validWords: WritableSignal<Array<string>>;
  private API = "https://boggle-backend.onrender.com/generate-board";

  constructor(private http: HttpClient, private readonly sessionStorageService: SessionStorageService) {
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
  }

  public getBoard(size: number): Observable<BoggleResponse> {
    return this.http.get<BoggleResponse>(`${this.API}?size=${size}`);
  }

  public async loadBoard(size: number, isRestart?: boolean): Promise<void> {
    new Promise((resolve) => {
      if (!this.boardData() || isRestart) {
        this.loaderService.toggleLoader();
        this.getBoard(size).subscribe((boardData: BoggleResponse) => {
          this.boardData.update((board: BoggleResponse) => board = boardData);
          this.validWords.update(validWords => validWords = this.boardData()?.words);
          this.sessionStorageService.setObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard, boardData);
          this.loaderService.toggleLoader();
          resolve(boardData);
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
    }
    this.lastVisitedTile.update((currentTile) => currentTile = tile);
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