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
}