import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tile } from '../models/table.model';

export interface BoggleResponse {
  board: string[][];
  words: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BoggleService {
  public currentWord: WritableSignal<string>;
  private selectedTiles: Array<Tile>;
  private currentTile: Tile | null;
  private API = "https://boggle-backend.onrender.com/generate-board";

  constructor(private http: HttpClient) {
    this.selectedTiles = new Array<Tile>();
    this.currentTile = null;
    this.currentWord = signal("");
  }

  public getBoard(size: number): Observable<BoggleResponse> {
    return this.http.get<BoggleResponse>(`${this.API}?size=${size}`);
  }

  public emptySelectedTiles() {
    this.selectedTiles = new Array<Tile>();
  }

  public isSelectedTile(tile: Tile): boolean {
    return this.selectedTiles.some((position: Tile) => position?.row === tile.row && position?.column === tile.column);
  }

  public addLetter(tile: Tile): void {
    const selectedPositionIndex = this.selectedTiles.findIndex((position: Tile) => position?.row === tile?.row && position?.column === tile?.column);
    const selectedTileLength = this.selectedTiles.length - 1;
    const isCurrentTile = this.selectedTiles[selectedTileLength]?.row === this.currentTile?.row &&
      this.selectedTiles[selectedTileLength]?.column === this.currentTile?.column &&
      this.selectedTiles[selectedTileLength]?.letter === this.currentTile?.letter;
    if (this.isSelectedTile(tile) && !isCurrentTile && selectedPositionIndex !== -1) {
      this.selectedTiles.splice(selectedPositionIndex);
    } else if (!this.isSelectedTile(tile) || !this.selectedTiles.length) {
      this.selectedTiles.push(tile);
      let word = "";
      this.selectedTiles.forEach(selectedTiles => word += selectedTiles.letter);
      this.currentWord.update(currentWord => currentWord = word);
    }
    this.currentTile = new Tile(tile?.row, tile?.column, tile?.letter);
  }
}