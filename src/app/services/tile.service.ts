import { Injectable } from "@angular/core";
import { ITileRects, ITiles } from "../interface/tile.interface";

@Injectable({
  providedIn: "root"
})
export class TileService {
  private tileRects: Array<ITileRects>;

  constructor(){
    this.tileRects = new Array<ITileRects>();
  }

  public cacheTileRects(): void {
    const elements = document.querySelectorAll('.tile-letter');

    this.tileRects = new Array<ITileRects>();

    elements.forEach((el) => {
      const element = el as HTMLElement;

      const row = Number(element.getAttribute('data-row'));
      const col = Number(element.getAttribute('data-col'));

      this.tileRects.push({
        row,
        col,
        rect: element.getBoundingClientRect()
      });
    });
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