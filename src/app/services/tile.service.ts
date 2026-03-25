import { Injectable } from "@angular/core";
import { ITileRects, ITiles } from "../interface/tile.interface";

@Injectable({
  providedIn: "root"
})
export class TileService {
  private tileRects: Array<ITileRects>;
  private tileElements: HTMLElement[] = [];

  constructor(){
    this.tileRects = new Array<ITileRects>();
  }

  public cacheTileRects(): void {
    this.tileRects = this.tileElements.map((element) => {
      const row = Number(element.getAttribute('data-row'));
      const col = Number(element.getAttribute('data-col'));

      return {
        row,
        col,
        rect: element.getBoundingClientRect()
      };
    });
  }

  public cacheTileElements(): void {
    this.tileElements = Array.from(
      document.querySelectorAll('.tile-letter')
    ) as HTMLElement[];
  }

  public getTileFromPoint(tileColumn: number, tileRow: number): ITiles | null {
    for (const tile of this.tileRects) {
      const tileRect = tile.rect;

      if (
        tileColumn >= tileRect.left &&
        tileColumn <= tileRect.right &&
        tileRow >= tileRect.top &&
        tileRow <= tileRect.bottom
      ) {
        return { tileRow: tile.row, tileColumn: tile.col };
      }
    }

    return null;
  }
}