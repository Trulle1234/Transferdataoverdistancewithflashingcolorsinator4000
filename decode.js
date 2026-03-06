import { nearestColor } from "./nearest.js"
import { hexColorMap } from "./main.js";

// vars

const IDLE = 0;
const SCANNING_FOR_START = 1;
const START_DETECTED = 2;

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

let hexArray = [];
let interval;

decodeButton.addEventListener('click', () => {
    state = SCANNING_FOR_START;
});

function scanForStart() {
    const FRAMES_TO_CHECK = 10;
    const FRAMES_NEEDED_TO_ACCEPT = 8;

    let index = frameIndex;
    let startColorCount = 0;
    for (let i = 0; i < FRAMES_TO_CHECK; i++) {
        if (frameArray[index] == "7") {
            startColorCount++;
        }
        index--;
        if (index < 0) {
            index = frameArraySize - 1;
        }
    }

    if (startColorCount > FRAMES_NEEDED_TO_ACCEPT) {
        state = START_DETECTED;
        console.log("YIPEEE!");
    }
}

function frame() {
    let nr = nearestColor(centerClolor, hexColorMap);
    frameArray[frameIndex] = nr;

    if (state == SCANNING_FOR_START) {
        scanForStart();
    }
    else if (state == START_DETECTED) {

    }

    frameIndex++;
    if (frameIndex>frameArraySize) {
        frameIndex = 0;
    }
}

function decode() {
    console.log(hexArray);

    let hexString = "";

    for (let i = 0; i < hexArray.length; i++) {
        const hex = hexArray[i];
        if (!hex) continue;

        let nr = nearestColor(hex, hexColorMap);

        hexString += nr;
    }

    // reset for next decode session
    hexArray.length = 0;

    console.log(hexString);

    hexString = hexString.split(/(\w\w)/g)
     .filter(p => !!p)
     .map(c => String.fromCharCode(parseInt(c, 7)))
     .join("");

    return hexString;
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