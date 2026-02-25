import { nearestColor } from "./nearest.js"
import { hexColorMap } from "./main.js";

// vars

let decodeButton = document.getElementById("decode")

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

// broken \/

let hexArray = [];
let interval;

decodeButton.addEventListener('mousedown', () => {
    interval = setInterval(() => {
        hexArray.push(centerClolor);
        console.log(hexArray);
        console.log(decode(hexArray))
    }, 30);
});

decodeButton.addEventListener('mouseup', () => clearInterval(interval));
decodeButton.addEventListener('mouseleave', () => clearInterval(interval));

function decode(data) {
    data = nearestColor(data)
    let hexString = "";

    for (let i = 0; i < data.length; i++) {
        let nr = hexColorMap[data[i]];

        if (nr && nr != "ä" && nr != "ö") {
            hexString += nr
        }
    }

    hexString = hexString.split(/(\w\w)/g)
     .filter(p => !!p)
     .map(c => String.fromCharCode(parseInt(c, 12)))
     .join("")

    return hexString
}

// down to here /\

// uptades

function updateCanvas() {
    ctx.drawImage(video, 0, 0);
    centerClolor = pickCenterPixel()
    drawCircle(centerClolor);
    window.requestAnimationFrame(updateCanvas);
}

// to make module script work

window.main = main;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.main = main;
    });
}