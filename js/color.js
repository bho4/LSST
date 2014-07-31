var Color = {
    color: 0,
    curview: null,
    remove: function() {
        var viewer = $("#iip-frame").contents().find("#viewer");
        $("img.contrast-tile", viewer).remove();
    },
    
    apply: function() {
        var viewer = $("#iip-frame").contents().find("#viewer");
        var tiles = $("img.tile", viewer);
        if ($("img.contrast-tile", viewer).length > 0) {
            $("img.contrast-tile", viewer).addClass("toBeRemoved");
        }
        
        var imageLoaded = 0;
        for (var i = 0; i < tiles.length; i++) {
            var c = document.createElement('canvas');
            c.width = tiles[i].width;
            c.height = tiles[i].height;
            var ctx = c.getContext('2d');
            ctx.drawImage(tiles[i], 0, 0);
            var imageData = ctx.getImageData(0, 0, tiles[i].width, tiles[i].height);
            var pixels = imageData.data;
            this.change_color_nomap(pixels);
            ctx.putImageData(imageData, 0, 0);
            var img = $('<img>')[0];
            img.className = "contrast-tile";
            img.style.position = "absolute";
            img.style.left = tiles[i].style.left;
            img.style.top = tiles[i].style.top;
            img.style.display = "none";
            img.onload = function() {
                imageLoaded++;
                
                if (imageLoaded === tiles.length) {
                    $("img.contrast-tile.toBeRemoved", viewer).remove();
                    $("img.contrast-tile", viewer).show();
                }
            };
            img.src = c.toDataURL();
            $("div.canvas", viewer).append(img);
        }
        
        this.curview = $("<canvas/>")[0];
        this.curview.width = IIPhistogram.curview.width;
        this.curview.height = IIPhistogram.curview.height;
        var ctx = this.curview.getContext("2d");
        var imageDataNew = ctx.createImageData(this.curview.width, this.curview.height);
        var pixels = imageDataNew.data;
        var copyFrom = IIPhistogram.curview.getContext("2d").getImageData(0, 0, this.curview.width, this.curview.height).data;
        this.change_color_nomap(pixels, copyFrom);
        ctx.putImageData(imageDataNew, 0, 0);
        
        $("img.contrast-tile", viewer).mousemove(function(event) {
            IIPhistogram.magnify(event, Color.curview);
        });
        
        $("img.contrast-tile", viewer).mouseleave(function() {
            $("#info-div #pixel-value").text("");
            $("#info-div #pixel-value").removeClass("blue");
            var magnifier = $("div#magnifier canvas")[0];
            var w = magnifier.width;
            var h = magnifier.height;
            var ctx = magnifier.getContext('2d');
            ctx.clearRect(0, 0, w, h);
        });
    },
    
    apply_with_contrast_on: function() {
        var map = null;
        if (IIPhistogram.contrast === 0) {
            map = LinearContrast.pvTopi;
        } else {
            map = LogContrast.pvTopi;
        }
        
        var viewer = $("#iip-frame").contents().find("#viewer");
        var tiles = $("img.tile", viewer);
        if ($("img.contrast-tile", viewer).length > 0) {
            $("img.contrast-tile", viewer).addClass("toBeRemoved");
        }
        
        var imageLoaded = 0;
        for (var i = 0; i < tiles.length; i++) {
            var c = document.createElement('canvas');
            c.width = tiles[i].width;
            c.height = tiles[i].height;
            var ctx = c.getContext('2d');
            ctx.drawImage(tiles[i], 0, 0);
            var imageData = ctx.getImageData(0, 0, tiles[i].width, tiles[i].height);
            var pixels = imageData.data;
            this.change_color(pixels, map);
            ctx.putImageData(imageData, 0, 0);
            var img = $('<img>')[0];
            img.className = "contrast-tile";
            img.style.position = "absolute";
            img.style.left = tiles[i].style.left;
            img.style.top = tiles[i].style.top;
            img.style.display = "none";
            img.onload = function() {
                imageLoaded++;
                
                if (imageLoaded === tiles.length) {
                    $("img.contrast-tile.toBeRemoved", viewer).remove();
                    $("img.contrast-tile", viewer).show();
                }
            };
            img.src = c.toDataURL();
            $("div.canvas", viewer).append(img);
        }
        
        this.curview = $("<canvas/>")[0];
        this.curview.width = IIPhistogram.curview.width;
        this.curview.height = IIPhistogram.curview.height;
        var ctx = this.curview.getContext("2d");
        var imageDataNew = ctx.createImageData(this.curview.width, this.curview.height);
        var pixels = imageDataNew.data;
        var copyFrom = IIPhistogram.curview.getContext("2d").getImageData(0, 0, this.curview.width, this.curview.height).data;
        this.change_color(pixels, map, copyFrom);
        ctx.putImageData(imageDataNew, 0, 0);
        
        $("img.contrast-tile", viewer).mousemove(function(event) {
            IIPhistogram.magnify(event, Color.curview);
        });
        
        $("img.contrast-tile", viewer).mouseleave(function() {
            $("#info-div #pixel-value").text("");
            $("#info-div #pixel-value").removeClass("blue");
            var magnifier = $("div#magnifier canvas")[0];
            var w = magnifier.width;
            var h = magnifier.height;
            var ctx = magnifier.getContext('2d');
            ctx.clearRect(0, 0, w, h);
        });
    },
    
    change_color_nomap: function(pixelsOut, pixelsIn) {
        var pixels = pixelsIn === undefined ? pixelsOut : pixelsIn;
        for (var i = 0; i < pixels.length; i+=4) {
            switch (this.color) {
                case 0:
                    pixelsOut[i] = pixels[i];
                    pixelsOut[i+1] = pixels[i+1];
                    pixelsOut[i+2] = pixels[i+2];
                    pixelsOut[i+3] = 255;
                    break;
                case 1:
                    pixelsOut[i] = pixels[i];
                    pixelsOut[i+1] = 0;
                    pixelsOut[i+2] = 0;
                    pixelsOut[i+3] = 255;
                    break;
                case 2:
                    pixelsOut[i] = 0;
                    pixelsOut[i+1] = pixels[i+1];
                    pixelsOut[i+2] = 0;
                    pixelsOut[i+3] = 255;
                    break;
                case 3:
                    pixelsOut[i] = 0;
                    pixelsOut[i+1] = 0;
                    pixelsOut[i+2] = pixels[i+2];
                    pixelsOut[i+3] = 255;
                    break;
            }
        }
    },
    
    change_color: function(pixelsOut, map, pixelsIn) {
        var pixels = pixelsIn === undefined ? pixelsOut : pixelsIn;
        for (var i = 0; i < pixels.length; i+=4) {
            switch (this.color) {
                case 0:
                    pixelsOut[i] = map[ pixels[i] ];
                    pixelsOut[i+1] = map[ pixels[i+1] ];
                    pixelsOut[i+2] = map[ pixels[i+2] ];
                    pixelsOut[i+3] = 255;
                    break;
                case 1:
                    pixelsOut[i] = map[ pixels[i] ];
                    pixelsOut[i+1] = 0;
                    pixelsOut[i+2] = 0;
                    pixelsOut[i+3] = 255;
                    break;
                case 2:
                    pixelsOut[i] = 0;
                    pixelsOut[i+1] = map[ pixels[i+1] ];
                    pixelsOut[i+2] = 0;
                    pixelsOut[i+3] = 255;
                    break;
                case 3:
                    pixelsOut[i] = 0;
                    pixelsOut[i+1] = 0;
                    pixelsOut[i+2] = map[ pixels[i+2] ];
                    pixelsOut[i+3] = 255;
                    break;
            }
        }
    }
};