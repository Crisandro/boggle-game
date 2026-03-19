import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

@Injectable({
  providedIn: "root"
})
export class CryptoService {

  private readonly SECRET_KEY = "SecretKey";

  public encrypt(value: unknown): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(value),
      this.SECRET_KEY
    ).toString();
  }

  public decrypt<T>(cipherText: string): T | null {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      return decrypted ? JSON.parse(decrypted) as T : null;
    } catch {
      return null;
    }
  }
}