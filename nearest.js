// based on https://gist.github.com/Ademking/560d541e87043bfff0eb8470d3ef4894
// but i just used some ai to make it work with hsl because i'm never figuring that out on my own

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h, s, l };
}

function distance(a, b) {
    const hDiff = Math.min(Math.abs(a.h - b.h), 1 - Math.abs(a.h - b.h)) * 360;
    const sDiff = (a.s - b.s) * 100;
    const lDiff = (a.l - b.l) * 100;
    return Math.sqrt(hDiff * hDiff + sDiff * sDiff + lDiff * lDiff);
}

export function nearestColor(colorHex, colors){
  // colors can be either an array of objects like {hex: "#ff0000"}
  // or a map/object where keys are identifiers and values are hex codes.
  if (!colorHex) {
    throw new Error("nearestColor: colorHex is required");
  }

  // normalize input map to array of entries {key, hex}
  let list;
  let returnKey = false;
  if (Array.isArray(colors)) {
    list = colors.map((el, i) => ({ key: i, hex: el.hex || el }));
  } else if (colors && typeof colors === "object") {
    returnKey = true;
    list = Object.entries(colors).map(([key, hex]) => ({ key, hex }));
  } else {
    throw new Error("nearestColor: second argument must be an array or object");
  }

  const rgb = hexToRgb(colorHex);
  if (!rgb) {
    throw new Error(`nearestColor: invalid hex color "${colorHex}"`);
  }
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  let lowest = Number.POSITIVE_INFINITY;
  let best = list[0];

  list.forEach(el => {
    const elRgb = hexToRgb(el.hex);
    if (!elRgb) return;
    const elHsl = rgbToHsl(elRgb.r, elRgb.g, elRgb.b);
    const tmp = distance(hsl, elHsl);
    if (tmp < lowest) {
      lowest = tmp;
      best = el;
    }
  });

  // when provided a map, return the key; otherwise return the object
  return returnKey ? best.key : best;
}
