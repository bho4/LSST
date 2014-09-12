var LinearLogContrast = {
    margin: null,
    w: 0,
    h: 0,
    fx: 0,
    fy: 0,
    line: null,
    values: [],
    intensities: [],
    pvToPIa: 0,
    pvToPIb: 0,
    trans: null,
    xs: [],
    ys: [],
    controlPointSelected: -1,
    pvTopi: new Array(256),
    curview: null,
    
    init: function() {
        this.values.push(0);
        this.values.push(128);
        this.values.push(255);
        
        this.intensities.push(0);
        this.intensities.push(128);
        this.intensities.push(255);
        
        this.contruct_linear_contrast_function();
        
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
            .x(function(d) { return LinearLogContrast.fx(d[0]); })
            .y(function(d) { return LinearLogContrast.fy(d[1]); });
    
        this.trans = "translate(" + this.margin.left + "," + this.margin.top + ")";
        
        this.xs.push(0);
        this.xs.push(0);
        this.xs.push(this.w);
        
        this.ys.push(this.h);
        this.ys.push(0);
        this.ys.push(0);
    },
    
    reset: function() {
        this.w = IIPhistogram.width - this.margin.left - this.margin.right;
        this.fx = 
        d3.scale.linear()
            .domain([0, 255])
            .range([0, this.w]);
    
        this.xs[0] = Math.round( this.values[0] / 255 * this.w );
        this.xs[1] = Math.round( this.values[1] / 255 * this.w );
        this.xs[2] = Math.round( this.values[2] / 255 * this.w );
        
    },
    
    new: function() {
        
        var svg = 
        d3.select("#" + IIPhistogram.svgid + " svg");

        // Draw the contrast function
        svg
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")" )
        .append("path")
            .datum(d3.range(256).map(function(i) { 
                if (i <= LinearLogContrast.values[0]) {
                    return [i, LinearLogContrast.intensities[0]];
                } else if (i === LinearLogContrast.values[1]) {
                    return [i, LinearLogContrast.intensities[1]];
                } else if (i > LinearLogContrast.values[0] && i < LinearLogContrast.values[1]){
                    return [i, LinearLogContrast.contrast_linear_function(i)]; 
                } else if (i >= LinearLogContrast.values[2]) {
                    return [i, LinearLogContrast.intensities[2]];
                } else {
                    return [i, LinearLogContrast.contrast_log_function(i)]; 
                }
            }))
            .attr("class", "line")
            .attr("d", this.line);
    },
    
    contruct_linear_contrast_function: function() {
        this.pvToPIa = (this.intensities[1]- this.intensities[0]) / (this.values[1]- this.values[0]);
        this.pvToPIb = this.intensities[1] - this.pvToPIa * this.values[1];
    },
    
    contrast_linear_function: function(x) {
        return this.pvToPIa * x + this.pvToPIb;
    },
    
    contrast_log_function: function(x) {
        var span = this.values[2] - this.values[1];
        var xmin = this.values[1];
        var xmax = this.values[2];
        var ymin = this.intensities[1];
        var ymax = this.intensities[2];
        return ( (ymax - ymin) / log10(span+1) ) * log10( span * (x - xmin) / (xmax - xmin) + 1 ) + ymin;
    },
    
    add_control_points: function() {
        var svg = 
        d3.select("#" + IIPhistogram.svgid + " svg");
        
        var cp = 
        svg.append("g")
            .attr("id", "control")
            .attr("transform", this.trans);

        cp.append("circle")
            .attr("id", "outer-control-point")
            .attr("cx", this.xs[1])
            .attr("cy", this.ys[1])
            .attr("r", 10);

        cp.append("circle")
            .attr("id", "inner-control-point")
            .attr("cx", this.xs[1])
            .attr("cy", this.ys[1])
            .attr("r", 3);
    
        // Draw black control point
        var bcp =
        svg.append("g")
            .attr("id", "black-control")
            .attr("transform", this.trans);

        bcp.append("circle")
            .attr("id", "outer-black-control-point")
            .attr("cx", this.xs[0])
            .attr("cy", this.ys[0])
            .attr("r", 10);
    
        bcp.append("circle")
            .attr("id", "inner-black-control-point")
            .attr("cx", this.xs[0])
            .attr("cy", this.ys[0])
            .attr("r", 3);
        
        var wcp =
        svg.append("g")
            .attr("id", "white-control")
            .attr("transform", this.trans);

        wcp.append("circle")
            .attr("id", "outer-white-control-point")
            .attr("cx", this.xs[2])
            .attr("cy", this.ys[2])
            .attr("r", 10);
    
        wcp.append("circle")
            .attr("id", "inner-white-control-point")
            .attr("cx", this.xs[2])
            .attr("cy", this.ys[2])
            .attr("r", 3);
    },
    
    move_black_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value >= this.values[1] ? this.values[1] - 1: value;
        this.values[0] = value;
        x = Math.round( value / 255 * this.w );
        this.set_control_point_attrs(0, x, y);
        this.contruct_linear_contrast_function();
        IIPhistogram.contrast_display(this.values[0], this.intensities[0]);
        return false;
    },
    
    move_middle_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value <= this.values[0] ? this.values[0] + 1 : value;
        value = value >= this.values[2] ? this.values[2] - 1: value;
        this.values[1] = value;
        x = Math.round( value / 255 * this.w );
//        if (value <= this.values[0] || value >= this.values[2])
//            return true;
        this.set_control_point_attrs(1, x, y);
        this.contruct_linear_contrast_function();
        IIPhistogram.contrast_display(this.values[1], this.intensities[1]);
        return false;
    },
    
    move_white_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value <= this.values[1] ? this.values[1] + 1 : value;
        this.values[2] = value;
        x = Math.round( value / 255 * this.w );
        this.set_control_point_attrs(2, x, y);
        IIPhistogram.contrast_display(this.values[2], this.intensities[2]);
        return false;
    },
    
    svg_callback: function() {
        $("#" + IIPhistogram.svgid + " svg")
            .mousemove(function(e) {
                if (LinearLogContrast.controlPointSelected < 0)
                    return;
                
                var offsetX = typeof e.offsetX === "undefined" ? LinearLogContrast.get_offsetX(e.pageX) : e.offsetX;
                var offsetY = typeof e.offsetY === "undefined" ? LinearLogContrast.get_offsetY(e.pageY) : e.offsetY;
                
                var x = offsetX - LinearLogContrast.margin.left;
                var y = offsetY - LinearLogContrast.margin.top;
                
                x = x < 0 ? 0 : x;
                x = x > LinearLogContrast.w ? LinearLogContrast.w : x;
                
                y = y < 0 ? 0 : y;
                y = y > LinearLogContrast.h ? LinearLogContrast.h : y;
//                if (!LinearLogContrast.is_valid_x_y(x, y))
//                    return;
                
                switch (LinearLogContrast.controlPointSelected) {
                    case 0:
                        if ( LinearLogContrast.move_black_control_point(x, y) )
                            return;
                        break;
                    case 1:
                        if ( LinearLogContrast.move_middle_control_point(x, y) )
                            return;
                        break;
                    case 2:
                        if ( LinearLogContrast.move_white_control_point(x, y) )
                            return;
                        break;
                }
                
                
                $("#" + IIPhistogram.svgid + " svg g path.line").remove();
                $("#" + IIPhistogram.svgid + " svg g#black-control").remove();
                $("#" + IIPhistogram.svgid + " svg g#control").remove();
                $("#" + IIPhistogram.svgid + " svg g#white-control").remove();
                LinearLogContrast.new();
                LinearLogContrast.add_control_points();
                
                
            })
            .mouseup(function() {
                if (LinearLogContrast.controlPointSelected >= 0)
                    LinearLogContrast.apply_contrast();
                LinearLogContrast.controlPointSelected = -1;
                LinearLogContrast.control_point_callback();
            })
            .mousestop(function() {
                if (LinearLogContrast.controlPointSelected < 0)
                    return;
                LinearLogContrast.apply_contrast();
            });
    },
    
    control_point_callback: function() {
        
        $("#outer-black-control-point")
            .mousedown(function(e) {
                LinearLogContrast.controlPointSelected = 0;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearLogContrast.values[0], LinearLogContrast.intensities[0]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
            
        $("#outer-control-point")
            .mousedown(function(e) {
                LinearLogContrast.controlPointSelected = 1;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearLogContrast.values[1], LinearLogContrast.intensities[1]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
            
        $("#outer-white-control-point")
            .mousedown(function(e) {
                LinearLogContrast.controlPointSelected = 2;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearLogContrast.values[2], LinearLogContrast.intensities[2]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
    },
    
    set_mid_control_point: function(offsetX, offsetY) {
        var x = offsetX - this.margin.left;
        var y = offsetY - this.margin.top;
        
        
        if (!this.is_valid_x_y(x, y))
            return;
        
        var value = Math.round( x / this.w * 255 );
        value = value <= this.values[0] ? this.values[0] + 1 : value;
        value = value >= this.values[2] ? this.values[2] - 1: value;
        this.values[1] = value;
        this.set_control_point_attrs(1, x, y);
    },
    
    is_valid_x_y: function(x, y) {
        return x >= 0 && x <= this.w && y >= 0 && y <= this.h;
    },
    
    set_control_point_attrs: function(i, x, y) {
        this.xs[i] = x;
        this.ys[i] = y;
        
        var intensity = Math.round( (this.h - y) / this.h * 255 );
        
        this.intensities[i] = intensity;
    },
    
    set_end_control_points: function(bv, bi, wv, wi) {
        this.values[0] = bv;
        this.intensities[0] = bi;
        this.values[2] = wv;
        this.intensities[2] = wi;
        
        this.contruct_linear_contrast_function();
        
        var bx = Math.round( bv / 255 * this.w );
        var by = Math.round( (255 - bi) / 255 * this.h);
        var wx = Math.round( wv / 255 * this.w );
        var wy = Math.round( (255 - wi) / 255 * this.h);
        
        this.xs[0] = bx;
        this.ys[0] = by;
        this.xs[2] = wx;
        this.ys[2] = wy;
    },
    
    map_pv_to_pi: function() {
        for (var i = 0; i < this.pvTopi.length; i++) {
            if (i <= this.values[0]) {
                this.pvTopi[i] = this.intensities[0];
            } else if (i >= this.values[2]) {
                this.pvTopi[i] = this.intensities[2];
            } else if (i > this.values[0] && i < this.values[1]) {
                this.pvTopi[i] = Math.round( this.contrast_linear_function(i) );
            } else if (i > this.values[1] && i < this.values[2]) {
                this.pvTopi[i] = Math.round( this.contrast_log_function(i) );
            } else {
                this.pvTopi[i] = this.intensities[1];
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
            IIPhistogram.magnify(event, LinearLogContrast.curview);
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
    
    dblclick_callback: function() {
        $("#" + IIPhistogram.svgid + " svg").dblclick(function(e) {
            var offsetX = typeof e.offsetX === "undefined" ? LinearLogContrast.get_offsetX(e.pageX) : e.offsetX;
            var offsetY = typeof e.offsetY === "undefined" ? LinearLogContrast.get_offsetY(e.pageY) : e.offsetY;
            
            var x = offsetX - LinearLogContrast.margin.left;
            var value = Math.round( x / LinearLogContrast.w * 256 );
            
            if (IIPhistogram.contrast === 0) {
                if (value <= LinearContrast.blackValue || value >= LinearContrast.whiteValue)
                    return;
            } else {
                if (value <= LogContrast.blackValue || value >= LogContrast.whiteValue)
                    return;
            }


            $("#" + IIPhistogram.svgid + " svg g path.line").remove();
            $("#" + IIPhistogram.svgid + " svg g#black-control").remove();
            $("#" + IIPhistogram.svgid + " svg g#control").remove();
            $("#" + IIPhistogram.svgid + " svg g#white-control").remove();
    //        console.log(e.offsetX);
    //        console.log(offsetX);
    //        console.log(e.offsetY);
    //        console.log(offsetY);

            LinearLogContrast.set_mid_control_point(offsetX, offsetY);
            IIPhistogram.contrast === 0 ? LinearLogContrast.set_end_control_points(LinearContrast.blackValue, LinearContrast.blackIntensity, LinearContrast.whiteValue, LinearContrast.whiteIntensity) 
                                        : LinearLogContrast.set_end_control_points(LogContrast.blackValue, LogContrast.blackIntensity, LogContrast.whiteValue, LogContrast.whiteIntensity);
            LinearLogContrast.new();
            LinearLogContrast.add_control_points();
            LinearLogContrast.svg_callback();
            LinearLogContrast.control_point_callback();
            LinearLogContrast.map_pv_to_pi();
            LinearLogContrast.apply_contrast();

            IIPhistogram.contrast = 2;

            $("#" + IIPhistogram.svgid + " svg").off("dblclick");

        });
    },
    
    get_offsetX: function(pageX) {
        var ml = parseInt($("body").css("margin-left"));
        var lw = $("#left-div").width();
        var ad = $("#adjuster").width();
        return pageX - ml - lw - ad - 3;
    },
    
    get_offsetY: function(pageY) {
        var ih = $("#info-div").height();
        var navh = $("#nav-pan-first-row").height();
        var hh = $("#histogram-info-div").height();
        var hch = $("#histogram-control-panel").height();
        return pageY - 8 - ih - 2*navh -16 - hh - 6- 10 -hch - 1;
    }
    
};