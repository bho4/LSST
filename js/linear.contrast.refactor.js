var LinearContrast = {
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
            .x(function(d) { return LinearContrast.fx(d[0]); })
            .y(function(d) { return LinearContrast.fy(d[1]); });
    
        this.trans = "translate(" + this.margin.left + "," + this.margin.top + ")";
        
        this.values[0] = 0;
        this.intensities[0] = 0;
        this.values[1] = 255;
        this.intensities[1] = 255;
        
        this.xs[0] = 0;
        this.ys[0] = IIPhistogram.height - this.margin.top - this.margin.bottom;
        this.xs[1] = IIPhistogram.width - this.margin.left - this.margin.right;
        this.ys[1] = 0;
        
        this.contruct_contrast_function(0);
        this.map_pv_to_pi();
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
    },
    
    reset: function() {
        this.values[0] = 0;
        this.intensities[0] = 0;
        this.values[1] = 255;
        this.intensities[1] = 255;
        
        this.xs[0] = 0;
        this.ys[0] = IIPhistogram.height - this.margin.top - this.margin.bottom;
        this.xs[1] = IIPhistogram.width - this.margin.left - this.margin.right;
        this.ys[1] = 0;
        
        this.contruct_contrast_function(0);
        this.map_pv_to_pi();
    },
    
    invert: function() {
         this.values[0] = 0;
        this.intensities[0] = 255;
        this.values[1] = 255;
        this.intensities[1] = 0;
        
        this.xs[0] = 0;
        this.ys[0] = 0;
        this.xs[1] = IIPhistogram.width - this.margin.left - this.margin.right;
        this.ys[1] = IIPhistogram.height - this.margin.top - this.margin.bottom;
        
        this.contruct_contrast_function(0);
        this.map_pv_to_pi();
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
                var _this = LinearContrast;
                if (i <= _this.values[0]) {
                    return [i, _this.intensities[0]];
                } else if (i >= _this.values[1]) {
                    return [i, _this.intensities[1]];
                } else {
                    return [i, _this.contrast_linear_function(i, 0)];
                }
            }))
            .attr("class", "line")
            .attr("d", this.line);
    },

    contruct_contrast_function: function(i) {
        this.pvToPIa[i] = (this.intensities[i+1]- this.intensities[i]) / (this.values[i+1]- this.values[i]);
        this.pvToPIb[i] = this.intensities[i+1] - this.pvToPIa[i] * this.values[i+1];
    },
    
    contrast_linear_function: function(x, i) {
        return this.pvToPIa[i] * x + this.pvToPIb[i];
    },
    
    add_control_points: function() {
        var svg = 
        d3.select("#" + IIPhistogram.svgid + " svg");
        
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
            .attr("cx", this.xs[1])
            .attr("cy", this.ys[1])
            .attr("r", 10);
    
        wcp.append("circle")
            .attr("id", "inner-white-control-point")
            .attr("cx", this.xs[1])
            .attr("cy", this.ys[1])
            .attr("r", 3);
    },
    
    set_control_point_attrs: function(i, x, y) {
        this.xs[i] = x;
        this.ys[i] = y;
        
        var intensity = Math.round( (this.h - y) / this.h * 255 );
        
        this.intensities[i] = intensity;
    },
    
    move_black_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value >= this.values[1] ? this.values[1] - 1: value;
        this.values[0] = value;
        x = Math.round( value / 255 * this.w );
        this.set_control_point_attrs(0, x, y);
        this.contruct_contrast_function(0);
        IIPhistogram.contrast_display(this.values[0], this.intensities[0]);
        return false;
    },
    
    move_white_control_point: function(x, y) {
        var value = Math.round( x / this.w * 255 );
        value = value <= this.values[0] ? this.values[0] + 1 : value;
        this.values[1] = value;
        x = Math.round( value / 255 * this.w );
        this.set_control_point_attrs(1, x, y);
        this.contruct_contrast_function(0);
        IIPhistogram.contrast_display(this.values[1], this.intensities[1]);
        return false;
    },
    
    svg_callback: function() {
        $("#" + IIPhistogram.svgid + " svg")
            .mousemove(function(e) {
                var _this = LinearContrast;
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
                if (LinearContrast.controlPointSelected >= 0)
                    IIPhistogram.apply_contrast();
                LinearContrast.controlPointSelected = -1;
                LinearContrast.control_point_callback();
            })
            .mousestop(function() {
                if (LinearContrast.controlPointSelected < 0)
                    return;
                LinearContrast.map_pv_to_pi();
                IIPhistogram.apply_contrast();
            });
    },
    
    control_point_callback: function() {
        
        $("#outer-black-control-point")
            .mousedown(function() {
                LinearContrast.controlPointSelected = 0;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearContrast.values[0], LinearContrast.intensities[0]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
            
        $("#outer-white-control-point")
            .mousedown(function() {
                LinearContrast.controlPointSelected = 1;
            })
            .mouseenter(function() {
                IIPhistogram.contrast_display(LinearContrast.values[1], LinearContrast.intensities[1]);
                return;
            })
            .mouseleave(function() {
                IIPhistogram.reset_contrast_display();
                return;
            });
    },
    
    map_pv_to_pi: function() {
        for (var i = 0; i < this.pvTopi.length; i++) {
            if (i <= this.values[0]) {
                this.pvTopi[i] = this.intensities[0];
            } else if (i >= this.values[1]) {
                this.pvTopi[i] = this.intensities[1];
            } else {
                this.pvTopi[i] = Math.round( this.contrast_linear_function(i, 0) );
            }
        }
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