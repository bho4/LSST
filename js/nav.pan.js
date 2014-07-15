var NavPan = {
    first_row_id: "nav-pan-first-row",
    second_row_id: "nav-pan-second-row",
    first_row_button_class: "nav-pan-first-row-button",
    second_row_button_class: "nav-pan-second-row-button",
    btns_first_row:
    [
        {btn: "file", res: "restore_file_second_row"},
        {btn: "edit"},
        {btn: "view"},
        {btn: "frame"},
        {btn: "bin"},
        {btn: "zoom", res: "restore_zoom_second_row"},
        {btn: "histogram", res: "restore_histogram_second_row"},
        {btn: "color"},
        {btn: "region"},
        {btn: "wcs"},
        {btn: "help"}
    ],
    btns_second_row:
    [
        [
            {btn: "open", fnc: "html"},
            {btn: "save"},
            {btn: "header"},
            {btn: "page setup"},
            {btn: "print"},
            {btn: "exit"}
        ],
        [
            {btn: "none"},
            {btn: "pointer"},
            {btn: "crosshair"},
            {btn: "colorbar"},
            {btn: "pan"},
            {btn: "zoom"},
            {btn: "rotate"},
            {btn: "crop"},
            {btn: "catalog"},
            {btn: "examine"}
        ],
        [
            {btn: "information"},
            {btn: "panner"},
            {btn: "magnifier"},
            {btn: "buttons"},
            {btn: "colorbar"},
            {btn: "graph horz"},
            {btn: "graph vert"}
        ],
        [
            {btn: "new"},
            {btn: "new rgb"},
            {btn: "new 3d"},
            {btn: "delete"},
            {btn: "clear"},
            {btn: "single"},
            {btn: "tile"},
            {btn: "blink"},
            {btn: "first"},
            {btn: "previous"},
            {btn: "next"},
            {btn: "last"}
        ],
        [
            {btn: "-"},
            {btn: "+"},
            {btn: "to fit"},
            {btn: "block 1"},
            {btn: "block 2"},
            {btn: "block 4"},
            {btn: "block 8"},
            {btn: "block 16"},
            {btn: "block 32"},
            {btn: "block 64"}
        ],
        [
            {btn: "-", fnc: "iip_zoom_out"},
            {btn: "+", fnc: "iip_zoom_in"},
            {btn: "to fit"},
            {btn: "zoom 1/8"},
            {btn: "zoom 1/4"},
            {btn: "zoom 1/2"},
            {btn: "zoom 1"},
            {btn: "zoom 2"},
            {btn: "zoom 4"},
            {btn: "zoom 8"}
        ],
        [
            {btn: "linear", fnc: "nav_pan_contrast_btns"},
            {btn: "log", fnc: "nav_pan_contrast_btns"},
            {btn: "power"},
            {btn: "square root"},
            {btn: "squared"},
            {btn: "asinh"},
            {btn: "sinh"},
            {btn: "min max"},
            {btn: "zscale"}
        ],
        [
            {btn: "grey"},
            {btn: "a"},
            {btn: "b"},
            {btn: "bb"},
            {btn: "he"},
            {btn: "i8"},
            {btn: "aips0"},
            {btn: "heat"},
            {btn: "cool"},
            {btn: "rainbow"},
            {btn: "invert map", fnc: "invert_color_map"}
        ],
        [
            {btn: "information"},
            {btn: "front"},
            {btn: "back"},
            {btn: "all"},
            {btn: "none"},
            {btn: "delete"},
            {btn: "list"},
            {btn: "load"},
            {btn: "save"}
        ],
        [
            {btn: "fk4"},
            {btn: "fk5"},
            {btn: "icrs"},
            {btn: "galactic"},
            {btn: "ecliptic"},
            {btn: "degrees"},
            {btn: "sexagesimal"}
        ],
        [
            {btn: "reference"},
            {btn: "user"},
            {btn: "keyboard"},
            {btn: "release"},
            {btn: "help desk"},
            {btn: "acknowledge"},
            {btn: "about", fnc: "to_github_repo"}
        ]
    ],
    
    init: function() {
        this.first_row();
        $($("." + this.first_row_button_class)[6]).trigger("click");
    },
    
    ratios: function(btns) {
        var count = 0;
        for (var i = 0; i < btns.length; i++) {
            // Set the base length to 2 so that we add 1 here
            count += (btns[i].btn.length + 1);
        }

        var ratios = [];

        for (var i = 0; i < btns.length; i++) {
            ratios.push((btns[i].btn.length + 1) / count);
        }

        return ratios;
    },
    
    first_row: function() {
        var HTML = "";
        var ratios = this.ratios(this.btns_first_row);
        for (var i = 0; i < this.btns_first_row.length; i++) {
            HTML += "<div class=\"table-cell " + this.first_row_button_class + "\" style=\"width: " + ratios[i] * 100 + "%;\">" + this.btns_first_row[i].btn + "</div>";
        }
        document.getElementById(this.first_row_id).innerHTML = HTML;
        this.first_row_callback();
    },
    
    second_row: function(type) {
        var HTML = "";
        var btns = this.btns_second_row[type];
        if (type === 5) {
            /* zoom */
            for (var i = 0; i < IIPV.num_resolutions; i++) {
                btns[i+3].fnc = "" + i;
            }
            for (var i = IIPV.num_resolutions; i < 7; i++) {
                btns[i+3].fnc = null;
            }
        }
        var ratios = this.ratios(btns);
        var btnHTML;
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].fnc === undefined || btns[i].fnc === null) {
                btnHTML = "<div class=\"table-cell not-implemented " + this.second_row_button_class + "\" style=\"width: " + ratios[i] * 100 + "%;\" name=\"" + btns[i].btn.replace(/\s+/g, '') + "-second-row-nav-btn\">" + btns[i].btn + "</div>";
            } else {
                btnHTML = "<div class=\"table-cell " + this.second_row_button_class + "\" style=\"width: " + ratios[i] * 100 + "%;\" name=\"" + btns[i].btn.replace(/\s+/g, '') + "-second-row-nav-btn\">" + btns[i].btn + "</div>";
            }
            HTML += btnHTML;
        }
        document.getElementById(this.second_row_id).innerHTML = HTML;
        this.second_row_callback();
    },
    
    first_row_callback: function() {
        $("." + this.first_row_button_class).click(function() {
            if ( $(this).hasClass("selected") ) {
                return;
            }
            $("." + NavPan.first_row_button_class).removeClass("selected");
            $("." + NavPan.first_row_button_class).removeClass("stripe-btn");
            $(this).addClass("selected");
            $(this).addClass("stripe-btn");
            var type = $("." + NavPan.first_row_button_class).index(this);
            NavPan.second_row(type);
            if ( NavPan.btns_first_row[type].hasOwnProperty("res") ) {
                //window[ NavPan.btns_first_row[type].res ]();
                NavPan[ NavPan.btns_first_row[type].res ]();
            }
        });
    },
    
    second_row_callback: function() {
        $("." + this.second_row_button_class).click(function() {
            if ($(this).hasClass("not-implemented")) {
                return;
            }
            var first_row = $("." + NavPan.first_row_button_class).index( $("." + NavPan.first_row_button_class + ".selected") );
            var second_row = $("." + NavPan.second_row_button_class).index(this);
            
            if (first_row === 0) {
                /* file */
                $("#right-div #image-pixel-histogram").hide(0, function() {
                    $($("." + NavPan.second_row_button_class)[0]).addClass("selected");
                    $($("." + NavPan.second_row_button_class)[0]).addClass("stripe-btn");
                    FileOpen[ NavPan.btns_second_row[first_row][second_row].fnc ]();
                    $("#right-div #file-open-div").fadeIn(1000);
                });
            }
            
            if (first_row === 5) {
                switch (second_row) {
                    case 0:
                        IIPV.zoomOut();
                        break;
                    case 1:
                        IIPV.zoomIn();
                        break;
                    case 2:
                        break;
                    default:
                        IIPV.zoomTo(second_row - 3);
                }
                NavPan.restore_zoom_second_row();
            }
            
            if (first_row === 6) {
                /* histogram */
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                } else {
                    var btns = $("." + this.second_row_button_class);
                    $(btns[0]).removeClass("selected");
                    $(btns[1]).removeClass("selected");
                    $(this).addClass("selected");
                }
                IIPhistogram[ NavPan.btns_second_row[first_row][second_row].fnc ](second_row);
            }
            
            if (first_row === 7) {
                IIPhistogram[ NavPan.btns_second_row[first_row][second_row].fnc ]();
            }
            
            if (first_row === 10) {
                switch (second_row) {
                    case 6:
                        window.open("https://github.com/bho4/LSST");
                }
            }
        });
    },
    
    restore_file_second_row: function() {
        if ($("#right-div #file-open-div").css("display") !== "none") {
            $($("." + NavPan.second_row_button_class)[0]).addClass("selected");
            $($("." + NavPan.second_row_button_class)[0]).addClass("stripe-btn");
        }
    },
    
    restore_histogram_second_row: function() {
        if ($("#right-div #file-open-div").css("display") !== "none" || $("#image-pixel-histogram").css("display") === "none") {
            $("#right-div #file-open-div").hide(0, function() {
                $("#image-pixel-histogram").fadeIn(1000);
            });
        }
        
        var btns = $("." + this.second_row_button_class);
        $(btns[0]).removeClass("selected");
        $(btns[1]).removeClass("selected");
        var contrast = $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li").hasClass("selected");
        if (contrast) {
            idx = $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li").index( $("#" + IIPhistogram.controlpanelid + " #contrast-dropdown ul li.selected") );
            $($("." + this.second_row_button_class)[idx]).addClass("selected");
        }
    },
    
    restore_zoom_second_row: function() {
        $("." + NavPan.second_row_button_class).removeClass("selected");
        $("." + NavPan.second_row_button_class).removeClass("stripe-btn");
        var i = IIPV.view.res;
        $($("." + NavPan.second_row_button_class)[i+3]).addClass("selected");
        $($("." + NavPan.second_row_button_class)[i+3]).addClass("stripe-btn");
    },
    
    is_room_panel_selected: function() {
        return $("." + this.first_row_button_class).index( $("." + this.first_row_button_class + ".selected") ) === 5;
    }
};