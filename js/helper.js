function getImageData(image) {
    var c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    var ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0, c.width, c.height);
    return ctx.getImageData(0, 0, c.width, c.height).data;
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}