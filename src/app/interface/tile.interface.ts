export interface ITiles {
  tileRow: number;
  tileColumn: number
}

export interface ITileRects {
  row: number;
  col: number;
  rect: DOMRect
}

export interface BoggleResponse {
  board: string[][];
  words: string[];
}