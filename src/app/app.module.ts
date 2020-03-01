import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { VideoJSRecordComponent } from "./videojs.record.component";

@NgModule({
  imports: [BrowserModule],
  declarations: [VideoJSRecordComponent],
  bootstrap: [VideoJSRecordComponent]
})
export class AppModule {}
