import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";

import videojs from "video.js";
import * as adapter from "webrtc-adapter/out/adapter_no_global.js";
import * as RecordRTC from "recordrtc";
import { v4 as uuidv4 } from "uuid";

/*
  // Required imports when recording audio-only using the videojs-wavesurfer plugin
  import * as WaveSurfer from 'wavesurfer.js';
  import * as MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';
  WaveSurfer.microphone = MicrophonePlugin;
  
  // Register videojs-wavesurfer plugin
  import * as Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
  */

// register videojs-record plugin with this import
import * as Record from "videojs-record/dist/videojs.record.js";

@Component({
  selector: "videojs-record",
  template: `
    <style>
      /* change player background color 
      .video-js video {
        background-color: #42f489;
      } */
    </style>
    <video
      id="video_{{ idx }}"
      class="video-js vjs-default-skin"
      playsinline
    ></video>
  `,
})
export class VideoJSRecordComponent implements OnInit, OnDestroy {
  // reference to the element itself: used to access events and methods

  private _elementRef: ElementRef;

  // index to create unique ID for component
  idx = "clip1";

  private config: any;
  private player: any;
  private plugin: any;

  // constructor initializes our declared vars
  constructor(elementRef: ElementRef) {
    this.player = false;

    // save reference to plugin (so it initializes)
    this.plugin = Record;

    // video.js configuration
    this.config = {
      controls: true,
      autoplay: false,
      fluid: false,
      loop: false,
      width: 1080,
      height: 720,
      controlBar: {
        volumePanel: false,
      },
      plugins: {
        /*
          // wavesurfer section is only needed when recording audio-only
          wavesurfer: {
              src: 'live',
              waveColor: '#36393b',
              progressColor: 'black',
              debug: true,
              cursorWidth: 1,
              msDisplayMax: 20,
              hideScrollbar: true
          },
          */
        // configure videojs-record plugin
        record: {
          audio: true,
          video: true,
          debug: true,
          maxLength: 240,
        },
      },
    };
  }

  ngOnInit() {}

  // use ngAfterViewInit to make sure we initialize the videojs element
  // after the component template itself has been rendered
  async ngAfterViewInit() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      handlerFunction(stream);
    });
    var chunks = [];
    let mediaRecorder;
    let handlerFunction = (stream) => {
      const mime = [
        "audio/ogg",
        "audio/mpeg",
        "audio/webm",
        "audio/wav",
      ].filter(MediaRecorder.isTypeSupported)[0];
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorder.ondataavailable = function (evt) {
        // push each chunk (blobs) in an array
        chunks.push(evt.data);
      };

      mediaRecorder.onstop = function (evt) {
        // Make blob out of our blobs, and open it.
        var blob = new Blob(chunks, { type: mime });
        console.log("here is audio data");
        console.log(blob);
        var reader = new FileReader();

        reader.onloadend = function () {
          console.log("blob as dataurl");
          console.log(reader.result);
          fetch(
            "https://fpxa3exj4e.execute-api.us-east-1.amazonaws.com/default/uploadFile",
            {
              method: "POST",
              body: JSON.stringify({
                key: "audio " + video_uuid,
                content: reader.result,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => console.log("success "))
            .catch((error) =>
              console.error("an upload error occurred! " + error)
            )
            .then((json) => console.log(json));
        };
        var dataURL = reader.readAsDataURL(blob);

        //console.log(dataURL);
      };
    };
    let video_uuid = uuidv4();

    // ID with which to access the template's video element
    let el = "video_" + this.idx;

    // setup the player via the unique element ID
    this.player = videojs(document.getElementById(el), this.config, () => {
      console.log("player ready! id:", el);

      // print version information at startup
      var msg =
        "Using video.js " +
        videojs.VERSION +
        " with videojs-record " +
        videojs.getPluginVersion("record") +
        " and recordrtc " +
        RecordRTC.version;
      videojs.log(msg);
    });

    // device is ready
    this.player.on("deviceReady", () => {
      console.log("device is ready!");
    });

    // user clicked the record button and started recording
    this.player.on("startRecord", () => {
      console.log("started recording!");
      mediaRecorder.start();
    });

    // user completed recording and stream is available
    this.player.on("finishRecord", async () => {
      // recordedData is a blob object containing the recorded data that
      // can be downloaded by the user, stored on server etc.
      mediaRecorder.stop();

      console.log("finished recording: ", this.player.recordedData);
      let videoName = Date.now() + ".webm";
      //this.player.record().saveAs({ video: Date.now() + ".webm" });
      this.player.record().stopDevice();
      //this.player.record().reset();
      var data = this.player.recordedData;
      var serverUrl =
        "https://fpxa3exj4e.execute-api.us-east-1.amazonaws.com/default/uploadFile";
      //var formData = new FormData();
      //formData.append('file', data, data.name);
      //console.log(data)
      //let frames: Blob[] = await this.extractFrames(this.player.record().getDuration());

      let frames: string[] = await this.extractFrames(
        this.player.record().getDuration()
      );
      //let frames: string[] = await this.extractFramesFromVideoNew(this.player.recordedData) as string[]
      console.log("frames are: ");
      console.log(frames);

      console.log("uploading recording:", data.name);
      let sendFrames = async () => {
        for (let i = 0; i < 20; i++) {
          fetch(serverUrl, {
            method: "POST",
            body: JSON.stringify({
              key: i.toString().padStart(2, "0") + " " + video_uuid,
              content: frames[i],
            }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => console.log("success "))
            .catch((error) =>
              console.error("an upload error occurred! " + error)
            )
            .then((json) => console.log(json));
        }
      };
      await sendFrames();
      fetch(serverUrl, {
        method: "POST",
        body: JSON.stringify({
          key: "end " + video_uuid,
          content: "finish",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => console.log("success "))
        .catch((error) => console.error("an upload error occurred! " + error))
        .then((json) => console.log(json));
    });

    // error handling
    this.player.on("error", (element, error) => {
      console.warn(error);
    });

    this.player.on("deviceError", () => {
      console.error("device error:", this.player.deviceErrorCode);
    });
  }

  // use ngOnDestroy to detach event handlers and remove the player
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = false;
    }
  }

  async extractFrames(duration: number): Promise<string[]> {
    let fps = 20 / duration;
    return new Promise(async (resolve) => {
      const video: HTMLVideoElement = document.getElementById(
        "video_clip1_html5_api"
      ) as HTMLVideoElement;

      let seekResolve;
      let flag = 0;

      video.addEventListener("seeked", async function () {
        console.log("seeked");
        if (seekResolve) seekResolve();
      });

      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      let [w, h] = [video.videoWidth, video.videoHeight];
      canvas.width = w;
      canvas.height = h;

      let frames = [];
      let interval = 1 / fps;
      let currentTime = 0;

      const updateFrame = () => {
        console.log("In Update Frame");
        if (currentTime >= duration) {
          flag = 1;
          return;
        }

        context.drawImage(video, 0, 0, w, h);
        let base64ImageData = canvas.toDataURL();
        frames.push(base64ImageData);
        // canvas.toBlob(function(blob){
        //     console.log(blob)
        //     frames.push(blob);
        //   },'image/png');
        console.log(currentTime);
        console.log(video.currentTime);
        console.log(duration);

        currentTime += interval;
        requestAnimationFrame(async () => {
          video.currentTime = currentTime;
          await new Promise((r) => (seekResolve = r));
          updateFrame();
        });
      };

      requestAnimationFrame(() => {
        video.currentTime = 0;
        requestAnimationFrame(updateFrame);
      });

      while (flag !== 1) {
        await new Promise((r) => setTimeout(r, 100));
      }
      resolve(frames);
    });
  }
}
