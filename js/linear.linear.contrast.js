var LinearLinearContrast = {
    margin: null,
    w: 0,
    h: 0,
    fx: 0,
    fy: 0,
    line: null,
    values: [],
    intensities: [],
    pvToPIa: [],
    pvToPIb: [],
    trans: null,
    xs: [],
    ys: [],
    controlPointSelected: -1,
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
            .x(function(d) { return LinearLinearContrast.fx(d[0]); })
            .y(function(d) { return LinearLinearContrast.fy(d[1]); });
    
        this.trans = "translate(" + this.margin.left + "," + this.margin.top + ")";
    },
    
    // Called in init.js
    fit: function() {
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
            .attr("transform", this.trans)
        .append("path")
            .datum(d3.range(256).map(function(i) {
                var _this = LinearLinearContrast;
                if (i <= _this.values[0]) {
                    return [i, _this.intensities[0]];
                } else if (i === _this.values[1]) {
                    return [i, _this.intensities[1]];
                } else if (i > _this.values[0] && i < _this.values[1]){
                    return [i, _this.contrast_linear_function(i, 0)]; 
                } else if (i >= _this.values[2]) {
                    return [i, _this.intensities[2]];
                } else {
                    return [i, _this.contrast_linear_function(i, 1)]; 
                }
            }))
            .attr("class", "line")
            .attr("d", this.line);
    },
    
    contruct_linear_contrast_function: function(i) {
        this.pvToPIa[i] = (this.intensities[i+1]- this.intensities[i]) / (this.values[i+1]- this.values[i]);
        this.pvToPIb[i] = this.intensities[i+1] - this.pvToPIa[i] * this.values[i+1];
    },
    
    contrast_linear_function: function(x, i) {
        return this.pvToPIa[i] * x + this.pvToPIb[i];
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
        this.contruct_linear_contrast_function(0);
        IIPhistogram.contrast_display(this.values[0], this.intensities[0]);
        return false;
    },
    
    move_middle_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value <= this.values[0] ? this.values[0] + 1 : value;
        value = value >= this.values[2] ? this.values[2] - 1: value;
        this.values[1] = value;
        x = Math.round( value / 255 * this.w );
        this.set_control_point_attrs(1, x, y);
        this.contruct_linear_contrast_function(0);
        this.contruct_linear_contrast_function(1);
        IIPhistogram.contrast_display(this.values[1], this.intensities[1]);
        return false;
    },
    
    move_white_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value <= this.values[1] ? this.values[1] + 1 : value;
        this.values[2] = value;
        x = Math.round( value / 255 * this.w );
        this.set_control_point_attrs(2, x, y);
        this.contruct_linear_contrast_function(1);
        IIPhistogram.contrast_display(this.values[2], this.intensities[2]);
        return false;
    },
    
    svg_callback: function() {
        $("#" + IIPhistogram.svgid + " svg")
            .mousemove(function(e) {
                var _this = LinearLinearContrast;
                if (_this.controlPointSelected < 0)
                    return;
                
                var offsetX = typeof e.offsetX === "undefined" ? _this.get_offsetX(e.pageX) : e.offsetX;
                var offsetY = typeof e.offsetY === "undefined" ? _this.get_offsetY(e.pageY) : e.offsetY;
                
                var x = offsetX - _this.margin.left;
                var y = offsetY - _this.margin.top;
                
                x = x < 0 ? 0 : x;
                x = x > _this.w ? _this.w : x;
                
                y = y < 0 ? 0 : y;
                y = y > _this.h ? _this.h : y;
                
                switch (_this.controlPointSelected) {
                    case 0:
                        if ( _this.move_black_control_point(x, y) )
                            return;
                        break;
                    case 1:
                        if ( _this.move_middle_control_point(x, y) )
                            return;
                        break;
                    case 2:
                        if ( _this.move_white_control_point(x, y) )
                            return;
                        break;
                }
                
                
                $("#" + IIPhistogram.svgid + " svg g path.line").remove();
                $("#" + IIPhistogram.svgid + " svg g#black-control").remove();
                $("#" + IIPhistogram.svgid + " svg g#control").remove();
                $("#" + IIPhistogram.svgid + " svg g#white-control").remove();
                _this.new();
                _this.add_control_points();
                
                
            })
            .mouseup(function() {
                if (LinearLinearContrast.controlPointSelected >= 0)
                    IIPhistogram.apply_contrast();
                LinearLinearContrast.controlPointSelected = -1;
                LinearLinearContrast.control_point_callback();
            })
            .mousestop(function() {
                if (LinearLinearContrast.controlPointSelected < 0)
                    return;
                LinearLinearContrast.map_pv_to_pi();
                IIPhistogram.apply_contrast();
            });
    },
    
    control_point_callback: function() {
        
        $("#outer-black-control-point")
            .mousedown(function() {
                LinearLinearContrast.controlPointSelected = 0;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearLinearContrast.values[0], LinearLinearContrast.intensities[0]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
            
        $("#outer-control-point")
            .mousedown(function() {
                LinearLinearContrast.controlPointSelected = 1;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearLinearContrast.values[1], LinearLinearContrast.intensities[1]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
            
        $("#outer-white-control-point")
            .mousedown(function() {
                LinearLinearContrast.controlPointSelected = 2;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearLinearContrast.values[2], LinearLinearContrast.intensities[2]);
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
                this.pvTopi[i] = Math.round( this.contrast_linear_function(i, 0) );
            } else if (i > this.values[1] && i < this.values[2]) {
                this.pvTopi[i] = Math.round( this.contrast_linear_function(i, 1) );
            } else {
                this.pvTopi[i] = this.intensities[1];
            }
        }
    },
    
    dblclick_callback: function() {
        $("#" + IIPhistogram.svgid + " svg").dblclick(function(e) {
            var offsetX = typeof e.offsetX === "undefined" ? LinearLinearContrast.get_offsetX(e.pageX) : e.offsetX;
            var offsetY = typeof e.offsetY === "undefined" ? LinearLinearContrast.get_offsetY(e.pageY) : e.offsetY;
            
            var x = offsetX - LinearLinearContrast.margin.left;
            var value = Math.round( x / LinearLinearContrast.w * 256 );
            
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
            LinearLinearContrast.set_mid_control_point(offsetX, offsetY);
            LinearLinearContrast.set_end_control_points(LinearContrast.values[0], LinearContrast.intensities[0], LinearContrast.values[1], LinearContrast.intensities[1]);
//            IIPhistogram.contrast === 0 ? LinearLinearContrast.set_end_control_points(LinearContrast.blackValue, LinearContrast.blackIntensity, LinearContrast.whiteValue, LinearContrast.whiteIntensity) 
//                                        : LinearLinearContrast.set_end_control_points(LogContrast.blackValue, LogContrast.blackIntensity, LogContrast.whiteValue, LogContrast.whiteIntensity);
            
            LinearLinearContrast.contruct_linear_contrast_function(0);
            LinearLinearContrast.contruct_linear_contrast_function(1);
            LinearLinearContrast.new();
            LinearLinearContrast.add_control_points();
            LinearLinearContrast.svg_callback();
            LinearLinearContrast.control_point_callback();
            LinearLinearContrast.map_pv_to_pi();
            //LinearLinearContrast.apply_contrast();

            IIPhistogram.contrast = 3;
            
            IIPhistogram.apply_contrast();

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