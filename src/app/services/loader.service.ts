import { Injectable, signal, WritableSignal } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class LoaderService {
  public showLoader: WritableSignal<boolean>;

  constructor() {
    this.showLoader = signal(false);
  }

  public toggleLoader() {
    this.showLoader.update(showLoader => !showLoader);
  }
}