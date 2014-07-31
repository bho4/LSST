var LinearContrast = {
    // Constant
    margin: null,
    w: null,
    h: null,
    fx: null,
    fy: null,
    line: null,
    // Variable
    blackValue: null,
    blackIntensity: null,
    whiteValue: null,
    whiteIntensity: null,
    pvToPIa: null,
    pvToPIb: null,
    BGT: null,
    WGT: null,
    x1: null,
    y1: null,
    x2: null,
    y2: null,
    curControlPointNum: null,
    curControlPoint: null,
    dx: null,
    dy: null,
    pvTopi: new Array(256),
    curview: null,
    
    init: function() {
        this.margin = IIPhistogram.margins[1];
        this.w = IIPhistogram.width - this.margin.left - this.margin.right;
        this.h = IIPhistogram.height - this.margin.top - this.margin.bottom;
        this.fx = 
        d3.scale.linear()
            .domain([0, 255])
            .range([0, this.w]);

        this.fy = 
        d3.scale.linear()
            .domain([0, 255])
            .range([this.h, 0]);
    
        this.line = d3.svg.line()
            .x(function(d) { return LinearContrast.fx(d[0]); })
            .y(function(d) { return LinearContrast.fy(d[1]); });
        
        this.x1 = 0;
        this.y1 = IIPhistogram.height - this.margin.top - this.margin.bottom;
        this.x2 = IIPhistogram.width - this.margin.left - this.margin.right;
        this.y2 = 0;
    },
    
    reset: function() {
        this.blackValue = 0;
        this.blackIntensity = 0;
        this.whiteValue = 255;
        this.whiteIntensity = 255;
        this.contruct_contrast_function();
        this.BGT = "translate(" + this.margin.left + "," + this.margin.top + ")";
        this.WGT = "translate(" + this.margin.left + "," + this.margin.top + ")";
    },
    
    invert: function() {
        this.blackValue = 0;
        this.blackIntensity = 255;
        this.whiteValue = 255;
        this.whiteIntensity = 0;
        this.contruct_contrast_function();
        this.BGT = "translate(" + this.margin.left + "," + (this.margin.top - this.h) + ")";
        this.WGT = "translate(" + this.margin.left + "," + (this.margin.top + this.h) + ")";
    },
    
    contruct_contrast_function: function() {
        this.pvToPIa = (this.whiteIntensity - this.blackIntensity) / (this.whiteValue - this.blackValue);
        this.pvToPIb = this.whiteIntensity - this.pvToPIa * this.whiteValue;
    },
    
    contrast_function: function(x) {
        return this.pvToPIa * x + this.pvToPIb;
    },
    
    map_pv_to_pi: function() {
        for (var i = 0; i < this.pvTopi.length; i++) {
            if (i <= this.blackValue) {
                this.pvTopi[i] = this.blackIntensity;
            } else if (i >= this.whiteValue) {
                this.pvTopi[i] = this.whiteIntensity;
            } else {
                this.pvTopi[i] = Math.round( this.contrast_function(i) );
            }
        }
    },
    
    apply_contrast: function() {
        var viewer = $("#iip-frame").contents().find("#viewer");
        var loadBarC = $("div.contrastLoadBarContainer", viewer)[0];
        var lB = loadBarC.getElement('div.loadBar');
        lB.setStyle( 'width', 0 );
        lB.set( 'html', '&nbsp;');
        loadBarC.setStyles({
            visibility: 'visible',
            opacity: 0.85
        });
        this.map_pv_to_pi();
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
            Color.change_color(pixels, this.pvTopi);
//            for (var j = 0; j < pixels.length; j+=4) {
//                pixels[j] = this.pvTopi[ pixels[j] ];
//                pixels[j+1] = this.pvTopi[ pixels[j+1] ];
//                pixels[j+2] = this.pvTopi[ pixels[j+2] ];
//            }
            ctx.putImageData(imageData, 0, 0);
            var img = $('<img>')[0];
            img.className = "contrast-tile";
            img.style.position = "absolute";
            img.style.left = tiles[i].style.left;
            img.style.top = tiles[i].style.top;
            img.style.display = "none";
            img.onload = function() {
                imageLoaded++;
                
                var w = (imageLoaded / tiles.length) * IIPV.navigation.options.loadBarWidth;
                var loadBarContainer = $("div.contrastLoadBarContainer", viewer)[0];
                var loadBar = loadBarContainer.getElement('div.loadBar');
                loadBar.setStyle( 'width', w );
                // Display the % in the progress bar
                loadBar.set( 'html', ' Contrast&nbsp;:&nbsp;' + Math.round(imageLoaded / tiles.length*100) + '%' );

                if( loadBarContainer.style.opacity != '0.85' ){
                  loadBarContainer.setStyles({
                    visibility: 'visible',
                    opacity: 0.85
                  });
                }
                
                if (imageLoaded === tiles.length) {
                    $("img.contrast-tile.toBeRemoved", viewer).remove();
                    $("img.contrast-tile", viewer).show();
                    loadBarContainer.fade('out');
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
        Color.change_color(pixels, this.pvTopi, copyFrom);
//        for (var k = 0; k < pixels.length; k+=4) {
//            switch (IIPhistogram.color) {
//                case 0:
//                    pixels[k] = this.pvTopi[ copyFrom[k] ];
//                    pixels[k+1] = this.pvTopi[ copyFrom[k+1] ];
//                    pixels[k+2] = this.pvTopi[ copyFrom[k+2] ];
//                    pixels[k+3] = 255;
//                    break;
//                case 1:
//                    pixels[k] = this.pvTopi[ copyFrom[k] ];
//                    pixels[k+1] = 0;
//                    pixels[k+2] = 0;
//                    pixels[k+3] = 255;
//                    break;
//            }
//            
//        }
        ctx.putImageData(imageDataNew, 0, 0);
        
        $("img.contrast-tile", viewer).mousemove(function(event) {
            IIPhistogram.magnify(event, LinearContrast.curview);
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
    
    new: function() {
        var svg = 
        d3.select("#" + IIPhistogram.svgid + " svg")
        
        // Callbacks
        $("#" + IIPhistogram.svgid + " svg")
            .mousemove(function(e) {
                LinearContrast.move(e);
            })
            .mouseup(function() {
                LinearContrast.deselect();
            });
        
        // Draw the contrast function
        svg
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")" )
        .append("path")
            .datum(d3.range(256).map(function(i) { 
                if (i <= LinearContrast.blackValue) {
                    return [i, LinearContrast.blackIntensity];
                } else if (i >= LinearContrast.whiteValue) {
                    return [i, LinearContrast.whiteIntensity];
                } else {
                    return [i, LinearContrast.contrast_function(i)]; 
                }
            }))
            .attr("class", "line")
            .attr("d", this.line);
        
        // Draw black control point
        var bcp =
        svg.append("g")
            .attr("id", "black-control")
            .attr("transform", this.BGT);

        bcp.append("circle")
            .attr("id", "outer-black-control-point")
            .attr("cx", this.x1)
            .attr("cy", this.y1)
            .attr("r", 10);
        
        // Callback
        $("#outer-black-control-point")
            .mousedown(function(e) {
                LinearContrast.select(e, 1);
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearContrast.blackValue, LinearContrast.blackIntensity)
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
            });

        
        bcp.append("circle")
            .attr("id", "inner-black-control-point")
            .attr("cx", this.x1)
            .attr("cy", this.y1)
            .attr("r", 3);
        
        // Draw white control point
        var wcp =
        svg.append("g")
            .attr("id", "white-control")
            .attr("transform", this.WGT);

        wcp.append("circle")
            .attr("id", "outer-white-control-point")
            .attr("cx", this.x2)
            .attr("cy", this.y2)
            .attr("r", 10);
        
        // Callback
        $("#outer-white-control-point")
            .mousedown(function(e) {
                LinearContrast.select(e, 2);
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearContrast.whiteValue, LinearContrast.whiteIntensity)
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
            });

        wcp.append("circle")
            .attr("id", "inner-white-control-point")
            .attr("cx", this.x2)
            .attr("cy", this.y2)
            .attr("r", 3);
    },
    
    select: function(event, num) {
        this.curControlPointNum = num;
        this.curControlPoint = event.target.parentNode;
        var coords = this.curControlPoint.getAttributeNS(null, "transform");
        coords = coords.slice(10, coords.length - 1).split(",");
    
        this.dx = parseInt(coords[0]) - event.clientX;
        this.dy = parseInt(coords[1]) - event.clientY;
    },
    
    move: function(event) {
        if (!this.curControlPoint)
            return;
        
        var x = event.clientX + this.dx;
        var y = event.clientY + this.dy;
        
        var xcp;
        var ycp;
        if (this.curControlPointNum === 1) {
            /* black control point */
            xcp = x - IIPhistogram.margin.left + this.x1;
            ycp = y - IIPhistogram.margin.top + this.y1;
            
            if ( Math.floor( (xcp - this.x1) / this.w * 255 ) >= this.whiteValue)
                return;
            
        } else {
            /* white control point */
            xcp = x - IIPhistogram.margin.left + this.x2;
            ycp = y - IIPhistogram.margin.top + this.y2;
            
            if ( Math.floor( (xcp - this.x1) / this.w * 255 ) <= this.blackValue)
                return;
        }
        
        if (xcp < this.x1) {
            x += this.x1 - xcp;
            xcp = this.x1;
        }
        if (xcp > this.x2) {
            x -= xcp - this.x2;
            xcp = this.x2;
        }
        if (ycp < this.y2) {
            y += this.y2 - ycp;
            ycp = this.y2;
        }
        if (ycp > this.y1) {
            y -= ycp - this.y1;
            ycp = this.y1;
        }
        
        if (this.curControlPointNum === 1) {
            this.blackValue = Math.floor( (xcp - this.x1) / this.w * 255 );
            this.blackIntensity = 255 - Math.floor( (ycp - this.y2) / this.h * 255 );
            IIPhistogram.contrast_display(this.blackValue, this.blackIntensity);
        } else {
            this.whiteValue = Math.floor( (xcp - this.x1) / this.w * 255 );
            this.whiteIntensity = Math.floor( (this.y1 - ycp) / this.h * 255 );
            IIPhistogram.contrast_display(this.whiteValue, this.whiteIntensity);
        }
        
        this.curControlPoint.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
        
        $("#" + IIPhistogram.svgid + " svg g path.line").remove();
        this.contruct_contrast_function();
        d3.select("#" + IIPhistogram.svgid + " svg g")
        .append("path")
            .datum(d3.range(256).map(function(i) { 
                if (i <= LinearContrast.blackValue) {
                    return [i, LinearContrast.blackIntensity];
                } else if (i >= LinearContrast.whiteValue) {
                    return [i, LinearContrast.whiteIntensity];
                } else {
                    return [i, LinearContrast.contrast_function(i)]; 
                }
            }))
            .attr("class", "line")
            .attr("d", this.line);
        
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        if (isChrome) {
            this.apply_contrast();
        }
    },
    
    deselect: function() {
        if (!this.curControlPoint)
            return;
        
        var coords = this.curControlPoint.getAttributeNS(null, "transform");
        
        if (this.curControlPointNum === 1) {
            this.BGT = coords;
        } else {
            this.WGT = coords;
        }
        
        this.curControlPoint = null;
        
        this.contruct_contrast_function();
        this.apply_contrast();
    }
};