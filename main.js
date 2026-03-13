let input = document.getElementById("input");
let flasButton = document.getElementById("flash");

// colors

const baseColor = "#1E1E1E"

const startEndColor = "#FF0000"

export const hexColorMap = {
    "0":        "#FFFFFF",
    "1":        "#00FF00",
    "2":        "#0000FF",
    "3":        "#FFFF00",
    "4":        "#00FFFF",
    "5":        "#FF00FF",
    "6":        "#000000",
    "7":        startEndColor
};

// encode

function encode(data) {
    data = data.split("")
     .map(c => c.charCodeAt(0).toString(5).padStart(2, "0"))
     .join("");
    return data;
}

// flash

async function flash(hexString) {
    let flashString = "";

    for (let i = 0; i < hexString.length; i++) {
        flashString += hexString[i];
        flashString += "6";
    }

    await flashFor(startEndColor, 1000)
    await calibrateColors(500)

    let index = 0;
    await new Promise(resolve => {
        const interval = setInterval(() => {
            const char = flashString[index];
            document.body.style.backgroundColor = hexColorMap[char] || "#000000";
            index++;
            if (index >= flashString.length) {
                clearInterval(interval);
                resolve();
            }
        }, 200);
    });

    await flashFor(startEndColor, 1000)

    document.body.style.backgroundColor = baseColor;
}

// calibration

async function calibrateColors(timePerColor) {
    for (const key of Object.keys(hexColorMap)) {
        if (key != "6") {
            await flashFor("#000000", 200)
            
            const color = hexColorMap[key];
            await flashFor(color, timePerColor);
        }
    }
}

async function flashFor(color, time) {
    document.body.style.backgroundColor = color
    await new Promise(r => setTimeout(r, time));
}

// inputs

if (flasButton) {
    flasButton.addEventListener("click", function() {
        const encoded = encode(input.value);
        console.log(encoded);
        flash(encoded);
    });
}