var IIPhistogram = {
    infodivid: "histogram-info-div",
    controlpanelid: "histogram-control-panel",
    svgid: "histogram-svg-div",
    shiftForMaxPV: 0,
    verticalaxis: 0,
    contrast: -1,
    margins: [{top: 16, right: 12, bottom: 24, left: 35}, {top: 24, right: 30, bottom: 24, left: 35}],
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
        LinearContrast.reset();
        LogContrast.init();
        LogContrast.reset();
        LinearLogContrast.init();
        LinearLinearContrast.init();
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
            IIPhistogram.contrast_control();
        });
        // Contrast Control Callback
        $("#" + this.controlpanelid + " #contrast-dropdown ul li").click(function() {
            var idx = $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li").index(this);
            if (idx === 2) {
                /* Invert */
                if ( $(this).hasClass("selected-no-color") ) {
                    $(this).removeClass("selected-no-color");
                    IIPhistogram.reset_contrast();
                } else {
                    $(this).addClass("selected-no-color");
                    IIPhistogram.invert_color_map();
                    return;
                }
            } else if (idx === 3) {
                /* Reset */
                $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li").removeClass("selected-no-color");
                IIPhistogram.reset_contrast();
            } else if ($(this).hasClass("selected")) {
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
            if (IIPhistogram.contrast < 0) {
                if (Color.color > 0) {
                    Color.apply();
                }
            } else {
                IIPhistogram.apply_contrast();
                IIPhistogram.contrast_control();
            }
        });
        // PC - Max Control Callback
        $("#" + this.controlpanelid + " #pcmax-dropdown ul li").click(function() {
            var idx = $("#" + IIPhistogram.controlpanelid + " #pcmax-dropdown ul li").index(this);
            switch (idx) {
                case 0:
                    /* Zoom Out */
                    if (IIPhistogram.shiftForMaxPV > 0) {
                        IIPhistogram.shiftForMaxPV--;
                    }
                    break;
                case 2:
                    /* Zoom In */
                    if (IIPhistogram.shiftForMaxPV < 50) {
                        IIPhistogram.shiftForMaxPV++;
                    }
                    break;
                default:
                    /* Reset */
                    IIPhistogram.shiftForMaxPV = 0;
                    break;
            }
            IIPhistogram.prepare_data();
            IIPhistogram.set_svg_margin();
            IIPhistogram.draw_histogram();
            IIPhistogram.contrast_control();
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
        
        this.contrast_control();
        this.apply_contrast();
        if (this.contrast < 0 && Color.color > 0) {
            Color.apply();
        }
//        if (this.contrast < 0) {
//            if (Color.color > 0) {
//                Color.apply();
//            }
//        } else {
//            this.apply_contrast();
//            this.contrast_control();
//        }
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
        return;
        if (this.contrast < 0) {
            this.margin.left = 18;
            for (var i = 0; i < this.max.toString().length; i++) {
                if (i !== 0 && i % 3 === 0) {
                    this.margin.left += 8;
                } else {
                    this.margin.left += 6;
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
                .tickFormat(d3.format("s"))
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
                .tickFormat(d3.format("s"))
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
        
        
            chart
            .append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis
                    .tickSize(height, 0, 0)
                    .tickFormat("")
                );
        
            chart
            .append("g")
                .attr("class", "grid")
                .call(yAxis
                    .tickSize(width, 0, 0)
                    .tickFormat("")
                );
        } else {
            chart
            .append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis
                    .tickSize(-height, 0, 0)
                    .tickFormat("")
                );
        
            chart
            .append("g")
                .attr("class", "grid")
                .call(yAxis
                    .tickSize(-width, 0, 0)
                    .tickFormat("")
                );
        }
    },
    
    apply_contrast: function() {
        switch (this.contrast) {
            case 0:
                this.apply_contrast_helper(LinearContrast);
                //LinearContrast.apply_contrast();
                break;
            case 1:
                LogContrast.apply_contrast();
                break;
            case 2:
                this.apply_contrast_helper(LinearLogContrast);
                //LinearLogContrast.apply_contrast();
                break;
            case 3:
                //LinearLinearContrast.apply_contrast();
                this.apply_contrast_helper(LinearLinearContrast);
                break;
            default:
                return;
        }
    },
    
    contrast_control: function() {
        switch (this.contrast) {
            case 0:
                LinearContrast.new();
                LinearContrast.add_control_points();
                LinearContrast.svg_callback();
                LinearContrast.control_point_callback();
//                LinearContrast.new();
                LinearLinearContrast.dblclick_callback();
                break;
            case 1:
                LogContrast.new();
                LinearLogContrast.dblclick_callback();
                break;
            case 2:
                LinearLogContrast.new();
                LinearLogContrast.add_control_points();
                LinearLogContrast.svg_callback();
                LinearLogContrast.control_point_callback();
                break;
            case 3:
                LinearLinearContrast.new();
                LinearLinearContrast.add_control_points();
                LinearLinearContrast.svg_callback();
                LinearLinearContrast.control_point_callback();
                break;
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
            case 2:
                this.contrast = 1;
                break;
            case 3:
                this.contrast = 0;
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
            var idx = $("#contrast-dropdown ul li").index($("#contrast-dropdown ul li.selected"));
            $("#" + this.controlpanelid + " #contrast-dropdown ul li").removeClass("selected");
            if (idx === 0) {
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
        
        
        // show pixel value here
        var imageData = this.curview.getContext('2d').getImageData(sx, sy, 1, 1);
        var pixel = imageData.data;
        var val = Color.color > 0 ? pixel[Color.color - 1] : pixel[0];
        $("#info-div #pixel-value").text(val);
        
        var copy = $('<canvas/>')[0];
        copy.width = curview.width;
        copy.height = curview.height;
        copy.getContext('2d').drawImage(curview, 0, 0);

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
    },
    
    
    add_contrast_tile: function(tile) {
        var viewer = $("#iip-frame").contents().find("#viewer");
        
        var c = document.createElement('canvas');
        c.width = tile.width;
        c.height = tile.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(tile, 0, 0);
        var imageData = ctx.getImageData(0, 0, tile.width, tile.height);
        var pixels = imageData.data;
        var ContrastObject;
        switch (this.contrast) {
            case 0:
                ContrastObject = LinearContrast;
                break;
            case 1:
                ContrastObject = LogContrast;
                break;
            case 2:
                ContrastObject = LinearLogContrast;
                break;
            case 3:
                ContrastObject = LinearLinearContrast;
                break;
        }
        
        if (this.contrast > -1) {
            Color.change_color(pixels, ContrastObject.pvTopi);
        } else {
            Color.change_color_nomap(pixels);
        }
//            for (var j = 0; j < pixels.length; j+=4) {
//                pixels[j] = this.pvTopi[ pixels[j] ];
//                pixels[j+1] = this.pvTopi[ pixels[j+1] ];
//                pixels[j+2] = this.pvTopi[ pixels[j+2] ];
//            }
        ctx.putImageData(imageData, 0, 0);
        var img = $('<img>')[0];
        img.id = "ct" + tile.id;
        img.className = "contrast-tile";
        img.style.position = "absolute";
        img.style.left = tile.style.left;
        img.style.top = tile.style.top;
        //img.style.display = "none";
        img.onload = function() {
            
        };
        img.src = c.toDataURL();
        $("div.canvas", viewer).append(img);
    },
    
    apply_contrast_helper: function(ContrastObject) {
        var viewer = $("#iip-frame").contents().find("#viewer");
        var loadBarC = $("div.contrastLoadBarContainer", viewer)[0];
        var lB = loadBarC.getElement('div.loadBar');
        lB.setStyle( 'width', 0 );
        lB.set( 'html', '&nbsp;');
        loadBarC.setStyles({
            visibility: 'visible',
            opacity: 0.85
        });
        
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
            Color.change_color(pixels, ContrastObject.pvTopi);
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
        
        ContrastObject.curview = $("<canvas/>")[0];
        ContrastObject.curview.width = IIPhistogram.curview.width;
        ContrastObject.curview.height = IIPhistogram.curview.height;
        var ctx = ContrastObject.curview.getContext("2d");
        var imageDataNew = ctx.createImageData(ContrastObject.curview.width, ContrastObject.curview.height);
        var pixels = imageDataNew.data;
        var copyFrom = IIPhistogram.curview.getContext("2d").getImageData(0, 0, ContrastObject.curview.width, ContrastObject.curview.height).data;
        Color.change_color(pixels, ContrastObject.pvTopi, copyFrom);
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
            IIPhistogram.magnify(event, ContrastObject.curview);
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
    }
};