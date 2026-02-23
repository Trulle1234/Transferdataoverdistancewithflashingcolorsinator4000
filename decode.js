let VIDEO = null;
let CANVAS = null;
let CTX = null;

function main() {
    CANVAS = document.getElementById("cameraCanvas")
    CTX = CANVAS.getContext("2d")

    let promise=navigator.mediaDevices.getUserMedia({video:true});

    promise.then(function(signal) {
        VIDEO = document.createElement("video");
        VIDEO.srcObject = signal;
        VIDEO.play();

        VIDEO.onloadeddata = function() {
            CANVAS.width = VIDEO.videoWidth;
            CANVAS.height = VIDEO.videoHeight;
            updateCanvas();
        }

    }).catch(function(err) {
        alert("Camera error: " + err)
    });
}

function updateCanvas() {
    CTX.drawImage(VIDEO, 0, 0);
    window.requestAnimationFrame(updateCanvas);
}