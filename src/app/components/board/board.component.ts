import { AfterViewInit, Component, HostListener, inject, NgZone, OnInit } from '@angular/core';
import { BoggleService } from '../../services/boggle.service';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/sessionStorage.service';
import { SessionStorageKeys } from '../../enums/sessionStorageKeys.enum';
import { Tile } from '../../models/table.model';
import { ITiles } from '../../interface/tile.interface';
import { TileService } from '../../services/tile.service';
import { CommonConstant } from '../../constant/common.constant';

@Component({
  selector: 'board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, AfterViewInit {
  protected readonly boggleService = inject(BoggleService);
  protected isSelecting: boolean = false;
  private lastPoint: ITiles | null = null;
  private audio = new Audio();

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly tileService: TileService,
    private ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    this.audio = new Audio(CommonConstant.MP3.CORRECT_SOUND_FX);
  }

  public ngAfterViewInit(): void {
    this.tileService.cacheTileRects();
  }

  protected onPointerDown(event: PointerEvent) {
    this.isSelecting = true;
    this.lastPoint = { tileRow: event.clientX, tileColumn: event.clientY };
    this.handlePointer(event);
  }

  protected onPointerMove(event: PointerEvent) {
    if (!this.isSelecting || !this.lastPoint) return;

    this.ngZone.runOutsideAngular(() => {
      this.interpolatePoints(this.lastPoint!, {
        tileRow: event.clientX,
        tileColumn: event.clientY
      });

      this.lastPoint = { tileRow: event.clientX, tileColumn: event.clientY };
    });
  }

  private interpolatePoints(
    start: ITiles,
    end: ITiles
  ): void {

    const rowDifference = end.tileRow - start.tileRow;
    const columnDifference = end.tileColumn - start.tileColumn;

    const steps = Math.max(Math.abs(rowDifference), Math.abs(columnDifference));

    for (let tileStep = 0; tileStep <= steps; tileStep += 2) {
      const currentRow = start.tileRow + (rowDifference * tileStep) / steps;
      const currentColumn = start.tileColumn + (columnDifference * tileStep) / steps;

      this.checkTileAtPoint(currentRow, currentColumn);
    }
  }

  private checkTileAtPoint(tileColumn: number, tileRow: number): void {
    const tile = this.tileService.getTileFromPoint(tileColumn, tileRow);
    if (!tile) return;

    this.extendSelection(tile.tileRow, tile.tileColumn);
  }

  private handlePointer(event: PointerEvent): void {
    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement;

    if (!element) return;

    const tile = element.closest('.tile-letter') as HTMLElement;

    if (!tile) return;

    const row = Number(tile.getAttribute('data-row'));
    const col = Number(tile.getAttribute('data-col'));

    if (isNaN(row) || isNaN(col)) return;

    if (!this.isSelecting) return;
    this.extendSelection(row, col);
  }

  protected extendSelection(row: number, column: number): void {
    if (!this.isSelecting) return;
    const currentTile = new Tile(row, column, this.boggleService.boardData()?.board[row][column]);
    if (this.boggleService.isTileSkip(currentTile)) {
      this.endSelection();
    } else {
      this.boggleService.addLetter(currentTile);
    }
  }

  protected isSelectedTile(row: number, column: number): boolean {
    const currentTile = new Tile(row, column, this.boggleService.boardData()?.board[row][column]);
    return this.boggleService.isSelectedTile(currentTile);
  }

  protected endSelection(): void {
    this.isSelecting = false;
    if (this.boggleService.validWords()?.includes(this.boggleService.currentWord())) {
      this.checkWordExists(this.boggleService.currentWord());
    }
    this.boggleService.overAllScore.set(this.boggleService.getScore());
    this.boggleService.currentWord.update(currentWord => currentWord = CommonConstant.STRING.EMPTY_STRING);
    this.boggleService.selectedTiles.update(selectedTiles => selectedTiles = new Array<Tile>());
    this.boggleService.lastVisitedTile.update(lastVisitedTile => lastVisitedTile = null);
  }

  protected checkWordExists(currentWord: string): void {
    if (!this.boggleService.correctWords()?.includes(currentWord)) {
      this.boggleService.correctWords.update(correctWords => ([...correctWords, currentWord]));
      this.boggleService.playSoundEffect(this.audio);
      this.sessionStorageService.setObjectItem<Array<string>>(SessionStorageKeys.CorrectWords, this.boggleService.correctWords());
    }
  }
  protected isValidWord(): boolean {
    return this.boggleService.validWords()?.includes(this.boggleService.currentWord()) &&
      !this.boggleService.correctWords()?.includes(this.boggleService.currentWord());
  }

  @HostListener('document:mouseup')
  public onMouseUp() {
    this.endSelection();
  }

  @HostListener('document:touchend')
  public onTouchEnd() {
    this.endSelection();
  }

  @HostListener('window:resize')
  public onResize(): void {
    this.tileService.cacheTileRects();
  }
}