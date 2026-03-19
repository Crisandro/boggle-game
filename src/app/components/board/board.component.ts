import { Component, OnInit } from '@angular/core';
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

  board: string[][] = [];
  validWords: string[] = [];

  constructor(
    private boggleService: BoggleService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.loadBoard(7);
    this.sessionandLocaltest();
  }

  loadBoard(size: number) {
    this.boggleService.getBoard(size).subscribe((data: BoggleResponse) => {
      this.board = data.board;
      this.validWords = data.words;
    });
  }

  public sessionandLocaltest() {
    this.sessionStorageService.setObjectItem(SessionStorageKeys.testsession, "test session storage");
    console.log(this.sessionStorageService.getObjectItem(SessionStorageKeys.testsession));

    this.localStorageService.setObjectItem(LocalStorageKeys.localtest, "local storage test");
    console.log(this.localStorageService.getObjectItem(LocalStorageKeys.localtest));
  }

}