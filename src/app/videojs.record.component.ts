import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";

import videojs from "video.js";
import * as adapter from "webrtc-adapter/out/adapter_no_global.js";
import * as RecordRTC from "recordrtc";
import * as ffmpeg from "../../node_modules/ffmpeg.js";


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



  ngOnInit() {

  }

  // use ngAfterViewInit to make sure we initialize the videojs element
  // after the component template itself has been rendered
  ngAfterViewInit() {
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
    });

    // user completed recording and stream is available
    this.player.on("finishRecord", async () => {
      // recordedData is a blob object containing the recorded data that
      // can be downloaded by the user, stored on server etc.
      console.log("finished recording: ", this.player.recordedData);
      let videoName = Date.now() + ".webm"
      //this.player.record().saveAs({ video: Date.now() + ".webm" });
      this.player.record().stopDevice();
      //this.player.record().reset();
      var data = this.player.recordedData;
      var serverUrl =
        "https://fpxa3exj4e.execute-api.us-east-1.amazonaws.com/default/uploadFile";
      //var formData = new FormData();
      //formData.append('file', data, data.name);
      //console.log(data)
      let frames: string[] = await this.extractFramesFromVideo() as string[]
      //let frames: string[] = await this.extractFramesFromVideoNew(this.player.recordedData) as string[]
      console.log("frames are: " + frames)
      

      console.log("uploading recording:", data.name);

      for(let i = 0; i < frames.length; i++){
        window.open(frames[i])
        fetch(serverUrl, {
          method: "POST",
          body: frames[i],
        })
          .then((response) => console.log("success "))
          .catch((error) => console.error("an upload error occurred! " + error))
          .then((json) => console.log(json));
      }

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

  async extractFramesFromVideo(fps=2) {
    return new Promise(async (resolve) => {
  
      // fully download it first (no buffering):
      //let videoBlob = await fetch(videoUrl).then(r => r.blob());
      //let videoObjectUrl = URL.createObjectURL(videoBlob);
      //let video = document.createElement("video");
      let video: HTMLVideoElement = document.getElementById("video_clip1_html5_api") as HTMLVideoElement

      let duration = video.duration;
  
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      let [w, h] = [video.videoWidth, video.videoHeight]
      canvas.width =  w;
      canvas.height = h;
  
      let frames = [];
      let interval = 1 / fps;
      let currentTime = 0.0;
      let flag = 0

      video.addEventListener('seeked', async function() {
        if (currentTime >= duration){
          console.log("frames inside function: " + frames)
          flag = 1
          return;
        }
        console.log("currentTime: " + currentTime)
        console.log("video.currentTime" + video.currentTime)
        //await new Promise(r => seekResolve=r);
        context.drawImage(video, 0, 0, w, h);
        let base64ImageData = canvas.toDataURL();
        frames.push(base64ImageData);
        //currentTime += interval;
        currentTime += interval;
        requestAnimationFrame(()=>{
          video.currentTime = currentTime
        })
      });
      video.currentTime = 0
      while(flag !== 1){
        setTimeout(()=>{
          return;
        }, 10)
      }
  
      resolve(frames);
      
    });
  }

}
