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

export function nearestColor(colorHex, colorsArray){
  const rgb = hexToRgb(colorHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  var lowest = Number.POSITIVE_INFINITY;
  var tmp;
  let index = 0;
  colorsArray.forEach( (el, i) => {
      const elRgb = hexToRgb(el.hex);
      const elHsl = rgbToHsl(elRgb.r, elRgb.g, elRgb.b);
      tmp = distance(hsl, elHsl)
      if (tmp < lowest) {
        lowest = tmp;
        index = i;
      };
      
  })
  return colorsArray[index];
  
}