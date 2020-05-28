import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


class SendPicturesRequest {
  constructor(public pictures: string[]){}
}


@Injectable({
  providedIn: "root",
})
export class HttpService {

  private serverUrl = "https://fpxa3exj4e.execute-api.us-east-1.amazonaws.com/default/uploadFile";

  constructor(private readonly http: HttpClient) {}

  sendPictures(pictures: string[]): Observable<any> {
      const request = new SendPicturesRequest(pictures);
      return this.http
      .put<void>(this.serverUrl, request, {
        observe: 'response',
        headers: this.setHeaders()
      })
  }

  private setHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
  }
}
