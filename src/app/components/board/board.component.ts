import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { BoggleService, BoggleResponse } from '../../services/boggle.service';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/sessionStorage.service';
import { LocalStorageService } from '../../services/localStorage.service';
import { SessionStorageKeys } from '../../enums/sessionStorageKeys.enum';
import { LocalStorageKeys } from '../../enums/localStorageKeys.enum';
import { Table } from '../../models/table.model';
import { EMPTY_STRING, EXISTS, SIX, ZERO } from '../../constant/common.constant';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  protected boardData: WritableSignal<BoggleResponse>;
  protected isSelecting: boolean = false;
  protected selectedPositions: Table[] = [];
  protected currentWord = EMPTY_STRING;
  protected validWords: string[] = [];
  protected correctWords: string[] = [];

  constructor(
    private readonly boggleService: BoggleService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly localStorageService: LocalStorageService
  ) {
    this.boardData = signal<BoggleResponse>(
      this.sessionStorageService.getObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard)
    );
  }
  

  public ngOnInit(): void {
    this.boardData.set(this.sessionStorageService.getObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard));
    this.loadBoard(SIX);
    this.sessionandLocaltest();
  }

  loadBoard(size: number) {
    if (!this.boardData()) {
      this.boggleService.getBoard(size).subscribe((boardData: BoggleResponse) => {
        this.boardData.update((board: BoggleResponse) => board = boardData);
        this.validWords = this.boardData()?.words;
        this.sessionStorageService.setObjectItem<BoggleResponse>(SessionStorageKeys.CurrentBoard, boardData);
      });
    }
  }

  public sessionandLocaltest() {
    this.sessionStorageService.setObjectItem(SessionStorageKeys.testsession, "test session storage");
    console.log(this.sessionStorageService.getObjectItem(SessionStorageKeys.testsession));

    this.localStorageService.setObjectItem(LocalStorageKeys.localtest, "local storage test");
    console.log(this.localStorageService.getObjectItem(LocalStorageKeys.localtest));
  }

  protected startSelection(row: number, column: number): void {
    this.isSelecting = true;
    this.selectedPositions = [];
    this.currentWord = EMPTY_STRING;
    this.addLetter(row, column);
  }

  protected extendSelection(row: number, column: number): void {
  if (!this.isSelecting) return;
  this.addLetter(row, column);
  }

  protected endSelection(): void {
  this.isSelecting = false;
  this.validWords.forEach(word => {
    if (word === this.currentWord) {
      this.checkWordExists(this.currentWord);
      }
    });
  }

  protected checkWordExists(currentWord: string): void {
  if (this.correctWords.includes(currentWord)) {
    alert(EXISTS);
    return;
  }

  this.correctWords = [...this.correctWords, currentWord];
}
  protected addLetter(row: number, column: number): void {
    this.selectedPositions.push({ row, column });
    this.currentWord += this.boardData()?.board[row][column];
  }

  protected isSelected(row: number, column: number): boolean {
    return this.selectedPositions.some(position => position?.row === row && position?.column === column);
  }

  protected onTouchMove(event: TouchEvent): void {
    const touch = event.touches[ZERO];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const tile = element?.closest('.tile');
    const row = Number(tile?.getAttribute('data-row'));
    const col = Number(tile?.getAttribute('data-col'));
    this.extendSelection(row, col);
  }

}