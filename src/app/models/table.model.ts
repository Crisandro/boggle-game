export class Tile {
  constructor(
    public row: number,
    public column: number,
    public letter: string
  ) {}
}

export class GetBoardResponse {
  constructor(
    public response: string
  ) {}
}