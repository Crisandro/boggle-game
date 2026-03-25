import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
import { ScoreBoardComponent } from './components/score-board/score-board.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LeaderBoardComponent } from './components/leader-board/leader-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent, ScoreBoardComponent, MenuComponent, LoaderComponent, LeaderBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'boggle-web';
}
