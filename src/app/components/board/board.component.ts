import { AfterViewInit, Component, HostListener, inject, NgZone, OnInit, signal, WritableSignal } from '@angular/core';
import { BoggleService, BoggleResponse } from '../../services/boggle.service';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/sessionStorage.service';
import { SessionStorageKeys } from '../../enums/sessionStorageKeys.enum';
import { Tile } from '../../models/table.model';
import { EXISTS, SIX } from '../../constant/common.constant';
import { ITiles } from '../../interface/tile.interface';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, AfterViewInit {
  protected readonly boggleService = inject(BoggleService);
  protected boardData: WritableSignal<BoggleResponse>;
  protected isSelecting: boolean = false;
  protected selectedPositions: Array<Tile>;
  protected validWords: string[] = [];
  protected correctWords: string[] = [];
  private lastPoint: ITiles | null = null;

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly tileService: TileService,
    private ngZone: NgZone
  ) {
    this.boardData = signal<BoggleResponse>(
      this.sessionStorageService.getObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard)
    );
    this.validWords = this.boardData()?.words;
    this.selectedPositions = new Array<Tile>();
  }

  public ngOnInit(): void {
    this.boardData.set(this.sessionStorageService.getObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard));
    this.loadBoard(SIX);
    setTimeout(() => this.tileService.cacheTileRects());
  }

  public loadBoard(size: number): void {
    if (!this.boardData()) {
      this.boggleService.getBoard(size).subscribe((boardData: BoggleResponse) => {
        this.boardData.update((board: BoggleResponse) => board = boardData);
        this.validWords = this.boardData()?.words;
        this.sessionStorageService.setObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard, boardData);
      });
    }
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
    //icheck pa if wla ni skip ug tile, endSelection() if ni skip
    const currentTile = new Tile(row, column, this.boardData()?.board[row][column]);
    this.boggleService.addLetter(currentTile);
  }

  protected isSelectedTile(row: number, column: number): boolean {
    const currentTile = new Tile(row, column, this.boardData()?.board[row][column]);
    return this.boggleService.isSelectedTile(currentTile);
  }

  protected endSelection(): void {
    this.isSelecting = false;
    if (this.validWords?.includes(this.boggleService.currentWord())) {
      this.checkWordExists(this.boggleService.currentWord());
    }
    this.boggleService.currentWord.update(currentWord => currentWord = "");
    this.boggleService.emptySelectedTiles();
  }

  protected checkWordExists(currentWord: string): void {
    if (this.correctWords?.includes(currentWord)) {
      alert(EXISTS);
      return;
    }

    this.correctWords = [...this.correctWords, currentWord];
  }

  @HostListener('document:mouseup')
  public onMouseUp() {
    this.endSelection();
  }

  @HostListener('document:touchend')
  public onTouchEnd() {
    this.endSelection();
  }

  @HostListener('document:resize')
  public adjustTileRects() {
    this.tileService.cacheTileRects();
  }
}