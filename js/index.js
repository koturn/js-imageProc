;(function(global, undefined) {
  "use strict";

  var WIDTH = 640;
  var HEIGHT = 480;
  var INTERVAL = 30;

  var video = document.getElementById("video");
  var localMediaStream = null;
  var hasGetUserMedia = function() {
    return !!(navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia);
  };

  navigator.getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia
    || navigator.msGetUserMedia;

  var captureTimerId = null;
  var video = document.createElement("video");
  video.width = WIDTH;
  video.height = HEIGHT;
  var videoCanvas = document.createElement("canvas");
  var videoCtx = videoCanvas.getContext("2d");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  var imageProc = new ImageProc();
  var imgprocFormList = document["form-imgproc"]["radiobox-imgproc"];
  var procDict = {
    "none": function(imgData) {
      return imgData;
    },
    "grayscale": function(imgData) {
      return imageProc.monochromize(imgData);
    },
    "np-reverse": function(imgData) {
      return imageProc.npReverse(imgData);
    },
    "laplacian": function(imgData) {
      return imageProc.applyFilter(imageProc.monochromize(imgData), "laplacian");
    }
  }

  document.getElementById("btn-start").addEventListener("click", function() {
    if (!hasGetUserMedia()) {
      alert("Web camera is not available on your browser");
      return;
    }
    global.URL = global.URL || global.webkitURL;
    navigator.getUserMedia({video: true}, function(stream) {
      video.src = global.URL.createObjectURL(stream);
      localMediaStream = stream;
      videoCanvas.width = WIDTH;
      videoCanvas.height = HEIGHT;
      imageProc.createBuffer(WIDTH, HEIGHT);

      var capture = null;
      (capture = function() {
        var t = Date.now();
        videoCtx.drawImage(video, 0, 0);
        var imgData = videoCtx.getImageData(0, 0, WIDTH, HEIGHT);
        ctx.putImageData(procDict[imgprocFormList.value](imgData), 0, 0);
        captureTimerId = setTimeout(capture, INTERVAL - (Date.now() - t));
      })();
    }, function(e) {
      console.log(e);
    });
  });

  document.getElementById("btn-stop").addEventListener("click", function() {
    if (localMediaStream) {
      localMediaStream.getVideoTracks()[0].stop();
      clearTimeout(captureTimerId);
    }
  });
})((this || 0).self || global);
