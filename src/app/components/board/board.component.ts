import { Component, OnInit } from '@angular/core';
import { BoggleService, BoggleResponse } from '../../services/boggle.service';
import { CommonModule } from '@angular/common';

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

  constructor(private boggleService: BoggleService) {}

  ngOnInit(): void {
    this.loadBoard(5);
  }

  loadBoard(size: number) {
    this.boggleService.getBoard(size).subscribe((data: BoggleResponse) => {
      this.board = data.board;
      this.validWords = data.words;
    });
  }

}