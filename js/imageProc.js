;(function(moduleDef) {
  "use strict";

  if (typeof bootstrap === "function") {  // Montage Require
    bootstrap("promise", moduleDef);
  } else if (typeof exports === "object" && typeof module === "object") {  // NodeJS or CommonJS
    module.exports = moduleDef();
  } else if (typeof define === "function" && define.amd) {  // RequireJS
    define(moduleDef);
  } else if (typeof ses !== "undefined") {  // SES (Secure EcmaScript)
    if (!ses.ok()) {
      return;
    } else {
      ses.makeImageProc = moduleDef;
    }
  } else if (typeof window !== "undefined" || typeof self !== "undefined") {  // <script>
    (typeof window !== "undefined" && window || self).ImageProc = moduleDef();
  } else {
    var global = Function("return this")();
    if (global.print) {  // SpiderMonkey or Rhino
      global.ImageProc = moduleDef();
    } else {
      throw new Error("This environment was not anticipated by imageProc.js.");
    }
  }
})(function() {
  "use strict";

  function ImageProc() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.bufferImage = null;
    this.filterDict = {
      "laplacian": [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1]
      ]
    };
  };

  ImageProc.prototype.createBuffer = function(width, height) {
    this.bufferData = new Uint8Array(width * height * 4);
  };

  ImageProc.prototype.npReverse = function(imgData) {
    var data = imgData.data;
    var i;
    for (var i = 0; i < data.length|0; i += 4|0) {
      data[i] = 0xff - data[i];
      data[i + 1] = 0xff - data[i + 1];
      data[i + 2] = 0xff - data[i + 2];
      data[i + 3] = data[i + 3];
    }
    return imgData;
  };

  ImageProc.prototype.monochromize = function(imgData) {
    var data = imgData.data;
    var i;
    for (var i = 0; i < data.length|0; i += 4|0) {
      var c = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
      data[i] = c
      data[i + 1] = c;
      data[i + 2] = c;
      data[i + 3] = data[i + 3];
    }
    return imgData;
  };

  ImageProc.prototype.applyFilter = function(imgData, filterName) {
    var dstData = imgData.data;
    var srcData = this.bufferData;
    srcData.set(dstData);
    var filter = this.filterDict[filterName];
    var fw = filter[0].length;
    var fh = filter.length;

    var x, y, i, j, fhw = (fw >> 1), fhh = (fh >> 1), xm = imgData.width - fhw, ym = imgData.height - fhh;
    for (y = fh >> 1; y < ym; y += 1|0) {
      for (x = fw >> 1; x < xm; x += 1|0) {
        var sum = 0;
        for (i = -fhh; i <= fhh; i += 1|0) {
          for (j = -fhw; j <= fhw; j += 1|0) {
            sum += srcData[((y + i) * imgData.width + (x + j)) << 2] * filter[i + fhh][j + fhw];
          }
        }
        var idx = (y * imgData.width + x) << 2;
        dstData[idx] = sum;
        dstData[idx + 1] = sum;
        dstData[idx + 2] = sum;
        dstData[idx + 3] = srcData[idx + 3];
      }
    }
    return imgData;
  };

  ImageProc.prototype.cvtImageData2Canvas = function(imgData) {
    this.canvas.width = imgData.width;
    this.canvas.height = imgData.height;
    this.ctx.putImageData(imgData, 0, 0);
    return this.canvas;
  };

  return ImageProc;
});
