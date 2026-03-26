import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { LoaderService } from "../../services/loader.service";

@Component({
  selector: 'loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  public loaderService = inject(LoaderService);
  letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  grid: string[] = Array(16).fill('');
  isSettling = false;

  ngOnInit() {
    this.scrambleOnce();
    this.startScrambleLoop();
  }

  randomLetter(): string {
    return this.letters[Math.floor(Math.random() * this.letters.length)];
  }

  scrambleOnce() {
    this.grid = this.grid.map(() => this.randomLetter());
  }

  startScrambleLoop() {
    setInterval(() => {
      this.isSettling = false;

      let count = 0;
      const interval = setInterval(() => {
        this.scrambleOnce();
        count++;

        if (count > 10) {
          clearInterval(interval);
          this.isSettling = true;
        }
      }, 1000);
    }, 5000);
  }
}