var IIPhistogram = {
    infodivid: "histogram-info-div",
    controlpanelid: "histogram-control-panel",
    svgid: "histogram-svg-div",
    shiftForMaxPV: 0,
    verticalaxis: 0,
    varicalaxisscales: ["Linear", "Logarithmic"],
    contrast: -1,
    margins: [{top: 12, right: 10, bottom: 28, left: 8}, {top: 28, right: 40, bottom: 28, left: 60}],
    width: null,
    height: null,
    max: null,
    margin: null,
    curview: null,
    
    init: function() {
        // Set the size of SVG container
        var ch = $("#right-div").height();
        var ih = $("#" + this.infodivid).height();
        var cph = $("#" + this.controlpanelid).height();
        var cpmt = $("#" + this.controlpanelid).css("margin-top");
        cpmt = cpmt.substring(0, cpmt.indexOf("px"));
        cpmt = parseInt(cpmt);
        var hsvgmt = $("#" + this.svgid).css("margin-top");
        hsvgmt = hsvgmt.substring(0, hsvgmt.indexOf("px"));
        hsvgmt = parseInt(hsvgmt);
        $("#" + this.svgid).height( ch - ih - cph - cpmt - hsvgmt );
        $("#" + this.svgid).width( $("#" + this.svgid).width() );
        // Remember the container Width and Height
        this.width = $("#" + this.svgid).width();
        this.height = $("#" + this.svgid).height();
        // Initialize Contrast Control
        LinearContrast.init();
        LogContrast.init();
        
        // Initialize Vertical Axis Control
        $($("#" + this.controlpanelid + " #vertical-axis-scale-dropdown ul li")[this.verticalaxis]).addClass("selected");
        $($("#" + this.controlpanelid + " #vertical-axis-scale-dropdown ul li")[this.verticalaxis]).addClass("stripe-btn");
        
        // Vertical Axis Control Callback
        $("#" + this.controlpanelid + " #vertical-axis-scale-dropdown ul li").click(function() {
            if ($(this).hasClass("selected")) {
                return;
            }
            $("#" + IIPhistogram.controlpanelid + " #vertical-axis-scale-dropdown ul li").removeClass("selected");
            $("#" + IIPhistogram.controlpanelid + " #vertical-axis-scale-dropdown ul li").removeClass("stripe-btn");
            IIPhistogram.verticalaxis = $("#" + IIPhistogram.controlpanelid + " #vertical-axis-scale-dropdown ul li").index(this);
            $(this).addClass("selected");
            $(this).addClass("stripe-btn");
            IIPhistogram.draw_histogram();
            IIPhistogram.invoke_contrast();
        });
        // Contrast Control Callback
        $("#" + this.controlpanelid + " #contrast-dropdown ul li").click(function() {
            if ($(this).hasClass("selected")) {
               $(this).removeClass("selected");
               IIPhistogram.contrast = -1;
               // Clear contrast canvas
               var viewer = $("#iip-frame").contents().find("#viewer");
               $("img.contrast-tile", viewer).remove();
            } else {
               $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li").removeClass("selected");
               IIPhistogram.contrast = $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li").index(this);
               $(this).addClass("selected");
            }
            
            // Control Panel buttons
            if (NavPan.is_histogram_panel_selected()) {
                NavPan.deselect_second_row_buttons();
                NavPan.toggle_second_row_button(IIPhistogram.contrast);
            }
            
            IIPhistogram.set_svg_margin();
            IIPhistogram.draw_histogram();
            IIPhistogram.invoke_contrast();
        });
        // Zoom Out Callback
        $("#" + this.controlpanelid + " #histogram-control-zoom-out").click(function() {
            if (IIPhistogram.shiftForMaxPV > 0) {
                IIPhistogram.shiftForMaxPV--;
                IIPhistogram.prepare_data();
                IIPhistogram.set_svg_margin();
                IIPhistogram.draw_histogram();
                IIPhistogram.invoke_contrast();
            }
        });
        // Zoom In Callback
        $("#" + this.controlpanelid + " #histogram-control-zoom-in").click(function() {
            if (IIPhistogram.shiftForMaxPV < 50) {
                IIPhistogram.shiftForMaxPV++;
                IIPhistogram.prepare_data();
                IIPhistogram.set_svg_margin();
                IIPhistogram.draw_histogram();
                IIPhistogram.invoke_contrast();
            }
        });
        // Reset Callback
        $("#" + this.controlpanelid + " #histogram-control-reset").click(function() {
            IIPhistogram.shiftForMaxPV = 0;
            if (IIPhistogram.contrast === 0) {
                LinearContrast.blackValue = 0;
                LinearContrast.blackIntensity = 0;
                LinearContrast.whiteValue = 255;
                LinearContrast.whiteIntensity = 255;
            } else if (IIPhistogram.contrast === 1) {
                LogContrast.blackValue = 0;
                LogContrast.blackIntensity = 0;
                LogContrast.whiteValue = 255;
                LogContrast.whiteIntensity = 255;
            }
            
            IIPhistogram.prepare_data();
            IIPhistogram.set_svg_margin();
            IIPhistogram.draw_histogram();
            IIPhistogram.reset_contrast();
            IIPhistogram.invoke_contrast();
         });
         
        // Toggle - & + embedded in the viewer
        $("body").keypress(function(event) {
            if (event.charCode === 72 || event.charCode === 104) {
                var viewer = $("#iip-frame").contents().find("#viewer");
                if ($("div.navcontainer", viewer).css("display") === "none") {
                    $("div.navcontainer", viewer).fadeIn(200);
                } else {
                    $("div.navcontainer", viewer).fadeOut(200);
                }
            }
         });
    },
    
    new: function() {
        this.get_current_view_canvas();
        this.prepare_data();
        this.set_svg_margin();
        this.draw_histogram();
        this.invoke_contrast();
    },
    
    prepare_data: function() {
        var pixels = this.curview.getContext("2d").getImageData(0, 0, this.curview.width, this.curview.height).data;
        this.data = Array.apply(null, Array(256)).map(Number.prototype.valueOf, 0);
        for (var i = 0; i < pixels.length; i+=4) {
            this.data[ pixels[i] ]++;
        }
        this.adjust_data_and_display_max();
        this.max = d3.max(this.data);
    },
    
    set_svg_margin: function() {
        this.margin = this.contrast < 0 ? this.margins[0] : this.margins[1];
        if (this.contrast < 0) {
            this.margin.left = 16;
            for (var i = 0; i < this.max.toString().length; i++) {
                if (i !== 0 && i % 3 === 0) {
                    this.margin.left += 10;
                } else {
                    this.margin.left += 8;
                }
            }
        }
    },
    
    draw_histogram: function() {
        $("#" + this.svgid).empty();
        
        var width = this.width - this.margin.left - this.margin.right;
        var height = this.height - this.margin.top - this.margin.bottom;
    
        var barWidth = this.width / this.data.length;
        var barInterval = 0.5;
        
        var x = 
        d3.scale.linear()
            .domain([0, 255])
            .range([0, width]);

        var xAxis = 
        d3.svg.axis()
            .scale(x)
            .orient("bottom");
    
        
        var y ;
        var yAxis;
        if (this.verticalaxis === 0) {
            y = 
            d3.scale.linear()
                .domain([0, this.max])
                .range([height, 0]);
            yAxis = 
            d3.svg.axis()
                .scale(y)
                .orient("left");
        } else {
            y = 
            d3.scale.log()
                .domain([1, this.max])
                .range([height, 0]);
        
            var ticks = [];
            var tick = 1;
            for (var i = 0; i < this.max.toString().length; i++) {
                ticks.push(tick);
                tick *= 10;
            }
        
            yAxis = 
            d3.svg.axis()
                .scale(y)
                .tickValues(ticks)
                .tickFormat(d3.format(",d"))
                .orient("left");
        }
        var chart = 
        d3.select("#" + this.svgid).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")" );
    
        chart
        .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chart
        .append("g")
            .attr("class", "y axis")
            .call(yAxis);
      
        chart
        .selectAll(".bar")
            .data(this.data)
        .enter().append("rect")
            .attr("x", function(d, i) { return x(i); })
            .attr("y", function(d) { return d === 0 ? 0 : y(d); })
            .attr("height", function(d) { return d === 0 ? 0 : height - y(d); })
            .attr("width", barWidth - barInterval)
            .attr("value", function(d) { return d; });
    
        $("#" + this.svgid + " svg g rect").mouseenter(function() {
            var idx = $("#" + IIPhistogram.svgid + " svg g rect").index(this);
            $("#" + IIPhistogram.infodivid + " #info-pv").text(idx);
            $("#" + IIPhistogram.infodivid + " #info-pc").text( $(this).attr("value") );
        }).mouseleave(function() {
            $("#" + IIPhistogram.infodivid + " #info-pv").text("");
            $("#" + IIPhistogram.infodivid + " #info-pc").text("");
        });
        
        
        if (this.contrast >= 0) {
            x = 
            d3.scale.linear()
                .domain([0, 255])
                .range([0, width]);
            xAxis = 
            d3.svg.axis()
                .scale(x)
                .orient("top");
        
            chart
            .append("g")
                .attr("class", "x axis top")
                .call(xAxis);
        
            y = 
            d3.scale.linear()
                .domain([0, 255])
                .range([height, 0]);
            yAxis = 
            d3.svg.axis()
                .scale(y)
                .orient("right");

            chart
            .append("g")
                .attr("transform", "translate(" + width + "," + 0 + ")" )
                .attr("class", "y axis right")
                .call(yAxis);
        }
    },
    
    invoke_contrast: function() {
        switch (this.contrast) {
            case 0:
                LinearContrast.new();
                break;
            case 1:
                LogContrast.new();
                break;
            default:
                return;
        }
    },
    
    reset_contrast: function() {
        switch (this.contrast) {
            case 0:
                LinearContrast.reset();
                break;
            case 1:
                LogContrast.reset();
                break;
            default:
                return;
        }
    },
    
    contrast_display: function(pv, brightness) {
        $("#" + this.infodivid + " #info-pv-contrast").text(pv);
        $("#" + this.infodivid + " #info-brightness").text(brightness);
    },
    
    reset_contrast_display: function() {
        $("#" + this.infodivid + " #info-pv-contrast").text("");
        $("#" + this.infodivid + " #info-brightness").text("");
    },
    
    invert_color_map: function() {
        if (this.contrast < 0) {
            LinearContrast.invert();
            $( $("#" + this.controlpanelid + " #contrast-dropdown ul li")[0] ).trigger("click");
        } else {
            $("#" + this.controlpanelid + " #contrast-dropdown ul li").removeClass("selected");
            if (this.contrast === 0) {
                LinearContrast.invert();
                $( $("#" + this.controlpanelid + " #contrast-dropdown ul li")[0] ).trigger("click");
            } else {
                LogContrast.invert();
                $( $("#" + this.controlpanelid + " #contrast-dropdown ul li")[1] ).trigger("click");
            }
        }
    },
    
    find_index_of_pixel_value_with_max_count: function() {
        var idx = 0;
        for (var i = 1; i < this.data.length; i++) {
            if (this.data[idx] < this.data[i])
                idx = i;
        }
        return idx;
    },
    
    find_pixel_value_with_kth_max_count: function(k) {
        var count = 0;
        var data = this.data;
        while (1) {
            if (count > 99) {
                alert("EXCESS");
                return 1;
            }
        
            var pivot = data[0];
        
            var arrSmaller = new Array();
            var arrLarger = new Array();
        
            for (var i = 0; i < data.length; i++) {
                if (data[i] < pivot) {
                    arrSmaller.push(data[i]);
                } else if (data[i] > pivot) {
                    arrLarger.push(data[i]);
                }
            }
        
            if (arrLarger.length === (k - 1)) {
                return pivot;
            } else if ( arrLarger.length >= k ){
                data = arrLarger;
            } else {
                k -= arrLarger.length;
                data = arrSmaller;
                data.push(pivot);
            }
            count++;
        }
    },
    
    adjust_data_and_display_max: function() {
        var maxIdx = -1;
        if (this.shiftForMaxPV === 0) {
            maxIdx = this.find_index_of_pixel_value_with_max_count();
        } else {
            var max = this.find_pixel_value_with_kth_max_count(this.shiftForMaxPV + 1);
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i] === max && maxIdx === -1) {
                    maxIdx = i;
                } else if (this.data[i] > max) {
                    this.data[i] = max;
                }
            }
        }
        
        $("#" + this.infodivid + " #info-pv-max").text(maxIdx);
        $("#" + this.infodivid + " #info-pc-max").text(this.data[maxIdx]);
    },
    
    get_current_view_canvas: function() {
        var viewer = $("#iip-frame").contents().find("#viewer");
        var tiles = $("img.tile", viewer);
               
        var rows = [];
        var cols = [];
        var id;
        for(var i = 0; i < tiles.length; i++) {
            id = tiles[i].id;
            id = id.match(/row(\d+)col(\d+)/);
            rows.push( parseInt(id[1]) );
            cols.push( parseInt(id[2]) );
        }
        rowMin = Math.min.apply(Math, rows);
        rowMax = Math.max.apply(Math, rows);
        //console.log( "Row Min: " + rowMin + " , Row Max: " + rowMax);
        colMin = Math.min.apply(Math, cols);
        colMax = Math.max.apply(Math, cols);
        //console.log( "Col Min: " + colMin + " , Col Max: " + colMax);
        
        var patches = [];
        for (var col = colMin; col <= colMax; col++) {
            patches.push([]);
            for (var row = rowMin; row <= rowMax; row++) {
                var cur_image = $("img#row" + row + "col" + col, viewer)[0];
                //console.log(cur_image);
                patches[col - colMin].push({
                    width: cur_image.width,
                    height: cur_image.height,
                    pixels: getImageData(cur_image)
                });
            }
        }
        
        var top = $("div.canvas", viewer).css("top");
        top = parseInt( top.substring(0, top.indexOf("px")) );
        var left = $("div.canvas", viewer).css("left");
        left = parseInt( left.substring(0, left.indexOf("px")) );
        //console.log( "div.canvas left: " + left + " , div.canvas top: " + top );
        
        var topTile00 = $("img#row" + rowMin + "col" + colMin, viewer).css("top");
        topTile00 = parseInt( topTile00.substring(0, topTile00.indexOf("px")) );
        var leftTile00 = $("img#row" + rowMin + "col" + colMin, viewer).css("left");
        leftTile00 = parseInt( leftTile00.substring(0, leftTile00.indexOf("px")) );
        //console.log( "Tile00 left: " + leftTile00 + " , Tile00 top: " + topTile00 );
        
        var startx = left < 0 ? - ( left + leftTile00) : 0;
        var starty = top < 0 ? - ( top + topTile00) : 0;
        //console.log("StartX: " + startx + " , StartY: " + starty);
        
        var curvieww = $(viewer).width();
        var curviewh = $(viewer).height();
        //console.log("CurViewWidth: " + curvieww + " , CurViewHeight: " + curviewh);
        
        // width of the new canvas
        var w = 0;
        for (var col = 0; col < patches[0].length; col++) {
            w += patches[0][col].width;
        }
        // height of the new canvas
        var h = 0;
        for (var row = 0; row < patches.length; row++) {
            h += patches[row][0].height;
        }
        //console.log("Width of the new canvas: " + w + " , Height of the new canvas: " + h);
        
        // New canvas
        var cn = $("<canvas/>")[0];
        cn.width = w;
        cn.height = h;
        var ctxn = cn.getContext("2d");
        // Pixels of the new canvas
        var imageDataNew = ctxn.createImageData(w, h);
        var pn = imageDataNew.data;
        
        var k = 0;
        for (var row = 0; row < patches.length; row++) {
            var cur_row = patches[row];
            for (var cur_row_pixels = 0; cur_row_pixels < cur_row[0].height; cur_row_pixels++) {
                for (var col = 0; col < cur_row.length; col++) {
                    var cur_patch = cur_row[col];
                    var kp = cur_row_pixels * cur_patch.width * 4;
                    for (var cur_col_pixels = 0; cur_col_pixels < cur_patch.width; cur_col_pixels++) {
                        pn[k] = cur_patch.pixels[kp];
                        pn[k+1] = cur_patch.pixels[kp+1];
                        pn[k+2] = cur_patch.pixels[kp+2];
                        pn[k+3] = cur_patch.pixels[kp+3];
                        k+=4;
                        kp+=4;
                    }
                }
            }
        }
        
        ctxn.putImageData(imageDataNew, 0, 0);
        
        this.curview = $("<canvas/>")[0];
        this.curview.width = curvieww < w ? curvieww : w;
        this.curview.height = curviewh < h ? curviewh : h;
        var curviewImageData = ctxn.getImageData(startx, starty, this.curview.width, this.curview.height);
        this.curview.getContext("2d").putImageData(curviewImageData, 0, 0);
        this.curview.id = "curview";
        left = left < 0 ? - left : 0;
        top = top < 0 ? - top : 0;
        //$("div.canvas #curview", viewer).remove();
        //$("div.canvas", viewer).append(this.curview);
        //$("canvas#curview", viewer).css( {position: "absolute", top: top + "px", left: left + "px", zIndex: -1} );
        
        $("img.tile", viewer).mousemove(function(event) {
            IIPhistogram.magnify(event, IIPhistogram.curview);
        });
        
        $("img.tile", viewer).mouseleave(function() {
            $("#info-div #pixel-value").text("");
            $("#info-div #pixel-value").removeClass("blue");
            var magnifier = $("div#magnifier canvas")[0];
            var w = magnifier.width;
            var h = magnifier.height;
            var ctx = magnifier.getContext('2d');
            ctx.clearRect(0, 0, w, h);
        });
    },
    
    paint: function(ctx, sx, sy) {
        var imageData = ctx.getImageData(sx, sy, 1, 1);
        var pixel = imageData.data;
        pixel[0] = 65;
        pixel[1] = 105;
        pixel[2] = 225;
        ctx.putImageData(imageData, sx, sy);
    },
    
    magnify: function(event, curview) {
        var viewer = $("#iip-frame").contents().find("#viewer");
        var top = $("div.canvas", viewer).css("top");
        top = parseInt( top.substring(0, top.indexOf("px")) );
        top = top < 0 ? 0 : top;
        var left = $("div.canvas", viewer).css("left");
        left = parseInt( left.substring(0, left.indexOf("px")) );
        left = left < 0 ? 0 : left;
        var sx = event.pageX - left;
        var sy = event.pageY - top;
        
        
        var copy = $('<canvas/>')[0];
        copy.width = curview.width;
        copy.height = curview.height;
        copy.getContext('2d').drawImage(curview, 0, 0);
        var imageData = copy.getContext('2d').getImageData(sx, sy, 1, 1);
        var pixel = imageData.data;
        $("#info-div #pixel-value").text(pixel[0]);
        $("#info-div #pixel-value").addClass("blue");
        var ctx = copy.getContext('2d');
        this.paint(ctx, sx, sy - 1);
        this.paint(ctx, sx + 1, sy);
        this.paint(ctx, sx, sy + 1);
        this.paint(ctx, sx - 1, sy);
        
        var num = 20;
        var area = copy.getContext('2d').getImageData(sx - num / 2, sy - num / 2, num, num);
        var magnifier = $("div#magnifier canvas")[0];
        var w = magnifier.width;
        var h = magnifier.height;
        var ctx = magnifier.getContext('2d');
        ctx.clearRect (0, 0, w, h);
        // Draw the targeted portion to a canvas first
        var canvas = $('<canvas/>')[0];
        canvas.width = w;
        canvas.height = h;
        var ctx2 =  canvas.getContext('2d');
        ctx2.clearRect (0, 0, w, h);
        ctx2.putImageData(area, 0, 0);
        // Scale and then draw
        ctx.scale(w / num, h / num);
        ctx.drawImage(canvas, 0, 0);
        ctx.scale(num / w, num / h); 
    },
    
    is_visible: function() {
        return $("#image-pixel-histogram").css("display") !== "none";
    },
    
    show: function() {
        $("#right-div #image-pixel-histogram").fadeIn(1000);
    },
    
    hide: function() {
        $("#right-div #image-pixel-histogram").hide();
    },
    
    trigger_contrast: function(type) {
        $( $("#" + this.controlpanelid + " #contrast-dropdown ul li")[type] ).trigger("click");
    }
};