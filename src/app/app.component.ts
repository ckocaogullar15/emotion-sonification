import { Component } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "emotion-sonification";
  message = "";
  constructor(private http: HttpClient) {}

  submit() {
    this.http
      .post<any>(
        "https://zg6r2c4n0m.execute-api.us-east-1.amazonaws.com/Default/analyzesentiment",
        this.message,
        {
          headers: new HttpHeaders({
            "Content-Type": "text/plain",
            "x-api-key": "Jb0JTIbC2y1WrNpFdIKqx702XULhNPYZ37eU9IMJ"
          })
        }
      )
      .subscribe(result => console.log(result));
  }
}
