import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { BoggleService } from "../../services/boggle.service";

@Component({
  selector: 'score-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css']
})
export class ScoreBoardComponent {
  protected boggleService = inject(BoggleService);

  protected scoreColor(word: string): string {
    const wordLength = word?.length;

    switch(wordLength) {
        case 3:
        case 4:
            return "grey";
        case 5:
            return "green";
        case 6:
            return "blue";
        case 7:
            return "red";
        case 8:
        default:
            return "gold";
    }
  }

  protected score(correctWord: string): number {
    return this.boggleService.getScore(correctWord);
  }
}