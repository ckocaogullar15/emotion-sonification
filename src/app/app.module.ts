import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { VideoJSRecordComponent } from "./videojs.record.component";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./home/home.component";
import { RecordComponent } from "./record/record.component";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  declarations: [
    VideoJSRecordComponent,
    AppComponent,
    HomeComponent,
    RecordComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
