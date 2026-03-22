import { inject } from "@angular/core";
import { BoggleResponse } from "../interface/tile.interface";
import { CryptoService } from "../services/crypto.service";

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