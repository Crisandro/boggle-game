import { Component, inject } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
import { ScoreBoardComponent } from './components/score-board/score-board.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoaderService } from './services/loader.service';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent, ScoreBoardComponent, MenuComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'boggle-web';
}
