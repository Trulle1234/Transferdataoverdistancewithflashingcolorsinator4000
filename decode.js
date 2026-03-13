import { nearestColor } from "./nearest.js"
import { hexColorMap } from "./main.js";

// vars

const calibrationKeys = ["0", "1", "2", "3", "4", "5", "7"];
let observedColorMap = { ...hexColorMap };

const IDLE = 0;
const SCANNING_FOR_START = 1;
const CALIBRATING = 2;
const SCANING_FOR_DATA = 3;
const DECODEING = 3;

let state = IDLE;

let decodeButton = document.getElementById("decode");

let video = null;
let canvas = null;
let ctx = null;

let centerClolor = null;

// runs on start

function main() {
    canvas = document.getElementById("cameraCanvas");
    ctx =   canvas.getContext("2d");

    let promise = navigator.mediaDevices.getUserMedia({video:true});

    promise.then(function(signal) {
        video = document.createElement("video");
        video.srcObject = signal;
        video.play();

        video.onloadeddata = function() {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            updateCanvas();
        };

    }).catch(function(err) {
        alert("Camera error: " + err);
    });
}

// color picking

function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function pickCenterPixel() {
    var centerX = Math.floor(canvas.width / 2);
    var centerY = Math.floor(canvas.height / 2);
    var c = canvas.getContext('2d');
    var p = c.getImageData(centerX, centerY, 1, 1).data;
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

    return hex;
}

function drawCircle(color) {
    var centerX = Math.floor(canvas.width / 2);
    var centerY = Math.floor(canvas.height / 2);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

// decode

const frameArraySize = 100;
let frameIndex = 0;
let frameArray = new Array(100);

let calibrationArray = [];

let nrArray = [];

let recordingFrameCount = 0;

decodeButton.addEventListener('click', () => {
    state = SCANNING_FOR_START;
});

function isRedDetected() {
    const FRAMES_TO_CHECK = 10;
    const FRAMES_NEEDED_TO_ACCEPT = 8;

    let index = frameIndex;
    let redCount = 0;

    for (let i = 0; i < FRAMES_TO_CHECK; i++) {
        if (frameArray[index] == "7") {
            redCount++;
        }

        index--;
        if (index < 0) {
            index = frameArraySize - 1;
        }
    }

    return redCount > FRAMES_NEEDED_TO_ACCEPT;
}

function frame() {
    let nr = nearestColor(centerClolor, hexColorMap);
    frameArray[frameIndex] = nr;

    if (state == SCANNING_FOR_START) {
        decodeButton.classList.toggle("scanning");

        if (isRedDetected()) {
            state = CALIBRATING;
            recordingFrameCount = 0;
            calibrationArray = [];
            console.log("started calibration");
        }
    }

    else if (state == CALIBRATING) {
        recordingFrameCount++;

        if (recordingFrameCount > 200 && isRedDetected()) {
            state = DECODEING;
            console.log("got calibration data");
            console.log(calibrationArray)
        }
        else if (nr != "7") {
            calibrationArray.push(centerClolor);
        }
    }

    else if (state == SCANING_FOR_DATA) {
        recordingFrameCount = 0;
        nrArray = [];

        recordingFrameCount++;

        if (recordingFrameCount > 200 && isRedDetected()) {
            state = DECODEING;
            console.log("stopped");
            console.log(nrArray)
        }
        else if (nr != "7") {
            nrArray.push(nr);
        }
    }

    else if (state == DECODEING) {
        decodeButton.classList.remove("scanning");
    }

    frameIndex++;
    if (frameIndex >= frameArraySize) {
        frameIndex = 0;
    }
}

function decode(array) {
    // convert array to string and trim/refine it

    string = string.split(/(\w\w)/g)
     .filter(p => !!p)
     .map(c => String.fromCharCode(parseInt(c, 7)))
     .join("");

    return string;
}

// uptades

function updateCanvas() {
    ctx.drawImage(video, 0, 0);
    centerClolor = pickCenterPixel();
    drawCircle(centerClolor);

    if (state != IDLE) {
        frame();
    }

    window.requestAnimationFrame(updateCanvas);
}

// to make module script work

window.main = main;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.main = main;
    });
}