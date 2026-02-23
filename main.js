let input = document.getElementById("input");
let flasButton = document.getElementById("flash");

// colors

const baseColor = "#1E1E1E"
const startEndColor = "#FF0000"

const hexColorMap = {
    "0": "#FFFFFF",
    "1": "#00FF00",
    "2": "#0000FF",
    "3": "#FFFF00",
    "4": "#00FFFF",
    "5": "#FF00FF",
    "6": "#800000",
    "7": "#808000",
    "8": "#008000",
    "9": "#800080",
    "a": "#008080",
    "b": "#000080"
};

// encode/decode

function encode(data) {
    data = data.split("")
     .map(c => c.charCodeAt(0).toString(12).padStart(2, "0"))
     .join("");
    return data;
}

function decode(data) {
    data = data.split(/(\w\w)/g)
     .filter(p => !!p)
     .map(c => String.fromCharCode(parseInt(c, 12)))
     .join("")
    return data
}

// flash

async function flash(hexString) {
    let flashString = "";

    for (let i = 0; i < hexString.length; i++) {
        flashString += hexString[i];
        flashString += "ö";
    }

    document.body.style.backgroundColor = startEndColor
    await new Promise(r => setTimeout(r, 1000));

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

    document.body.style.backgroundColor = startEndColor
    await new Promise(r => setTimeout(r, 1000));
    
    document.body.style.backgroundColor = baseColor;
}

// inputs

flasButton.addEventListener("click", function() {
    const encoded = encode(input.value);
    console.log(encoded);
    flash(encoded);
});