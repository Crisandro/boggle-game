import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { BoggleService, BoggleResponse } from '../../services/boggle.service';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/sessionStorage.service';
import { LocalStorageService } from '../../services/localStorage.service';
import { SessionStorageKeys } from '../../enums/sessionStorageKeys.enum';
import { LocalStorageKeys } from '../../enums/localStorageKeys.enum';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  protected boardData: WritableSignal<BoggleResponse>;

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
    this.loadBoard(6);
    this.sessionandLocaltest();
  }

  public loadBoard(size: number) {
    if (!this.boardData()) {
      this.boggleService.getBoard(size).subscribe((boardData: BoggleResponse) => {
        this.boardData.update((board: BoggleResponse) => board = boardData);
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

}