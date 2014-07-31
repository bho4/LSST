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
        {btn: "color", res: "restore_color_second_row"},
        {btn: "region"},
        {btn: "wcs"},
        {btn: "help"}
    ],
    
    btns_second_row:
    [
        [
            {btn: "open", implemented: true},
            {btn: "save", implemented: false},
            {btn: "header", implemented: false},
            {btn: "page setup", implemented: false},
            {btn: "print", implemented: false},
            {btn: "exit", implemented: false}
        ],
        [
            {btn: "none", implemented: false},
            {btn: "pointer", implemented: false},
            {btn: "crosshair", implemented: false},
            {btn: "colorbar", implemented: false},
            {btn: "pan", implemented: false},
            {btn: "zoom", implemented: false},
            {btn: "rotate", implemented: false},
            {btn: "crop", implemented: false},
            {btn: "catalog", implemented: false},
            {btn: "examine", implemented: false}
        ],
        [
            {btn: "information", implemented: false},
            {btn: "panner", implemented: false},
            {btn: "magnifier", implemented: false},
            {btn: "buttons", implemented: false},
            {btn: "colorbar", implemented: false},
            {btn: "graph horz", implemented: false},
            {btn: "graph vert", implemented: false}
        ],
        [
            {btn: "new", implemented: false},
            {btn: "new rgb", implemented: false},
            {btn: "new 3d", implemented: false},
            {btn: "delete", implemented: false},
            {btn: "clear", implemented: false},
            {btn: "single", implemented: false},
            {btn: "tile", implemented: false},
            {btn: "blink", implemented: false},
            {btn: "first", implemented: false},
            {btn: "previous", implemented: false},
            {btn: "next", implemented: false},
            {btn: "last", implemented: false}
        ],
        [
            {btn: "-", implemented: false},
            {btn: "+", implemented: false},
            {btn: "to fit", implemented: false},
            {btn: "block 1", implemented: false},
            {btn: "block 2", implemented: false},
            {btn: "block 4", implemented: false},
            {btn: "block 8", implemented: false},
            {btn: "block 16", implemented: false},
            {btn: "block 32", implemented: false},
            {btn: "block 64", implemented: false}
        ],
        [
            {btn: "-", implemented: true},
            {btn: "+", implemented: true},
            {btn: "to fit", implemented: false},
            {btn: "zoom 1/8", implemented: "dynamically decided"},
            {btn: "zoom 1/4", implemented: "dynamically decided"},
            {btn: "zoom 1/2", implemented: "dynamically decided"},
            {btn: "zoom 1", implemented: "dynamically decided"},
            {btn: "zoom 2", implemented: "dynamically decided"},
            {btn: "zoom 4", implemented: "dynamically decided"},
            {btn: "zoom 8", implemented: "dynamically decided"}
        ],
        [
            {btn: "linear", implemented: true},
            {btn: "log", implemented: true},
            {btn: "power", implemented: false},
            {btn: "square root", implemented: false},
            {btn: "squared", implemented: false},
            {btn: "asinh", implemented: false},
            {btn: "sinh", implemented: false},
            {btn: "min max", implemented: false},
            {btn: "zscale", implemented: false}
        ],
        [
            {btn: "grey", implemented: false},
            {btn: "red", implemented: true},
            {btn: "green", implemented: true},
            {btn: "blue", implemented: true},
            {btn: "a", implemented: false},
            {btn: "b", implemented: false},
            {btn: "bb", implemented: false},
            {btn: "he", implemented: false},
            {btn: "i8", implemented: false},
            {btn: "aips0", implemented: false},
            {btn: "heat", implemented: false},
            {btn: "cool", implemented: false},
            {btn: "rainbow", implemented: false},
            {btn: "invert map", implemented: true}
        ],
        [
            {btn: "information", implemented: false},
            {btn: "front", implemented: false},
            {btn: "back", implemented: false},
            {btn: "all", implemented: false},
            {btn: "none", implemented: false},
            {btn: "delete", implemented: false},
            {btn: "list", implemented: false},
            {btn: "load", implemented: false},
            {btn: "save", implemented: false}
        ],
        [
            {btn: "fk4", implemented: false},
            {btn: "fk5", implemented: false},
            {btn: "icrs", implemented: false},
            {btn: "galactic", implemented: false},
            {btn: "ecliptic", implemented: false},
            {btn: "degrees", implemented: false},
            {btn: "sexagesimal", implemented: false}
        ],
        [
            {btn: "reference", implemented: false},
            {btn: "user", implemented: false},
            {btn: "keyboard", implemented: false},
            {btn: "release", implemented: false},
            {btn: "help desk", implemented: false},
            {btn: "acknowledge", implemented: false},
            {btn: "about", implemented: true}
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
        $("#" + this.first_row_id).html(HTML);
        this.first_row_callback();
    },
    
    first_row_callback: function() {
        $("." + this.first_row_button_class).click(function() {
            if ( $(this).hasClass("selected") ) {
                return;
            }
            
            var idx = $("." + NavPan.first_row_button_class).index(this);
            NavPan.deselect_first_row_buttons();
            NavPan.select_first_row_button(idx);
            NavPan.second_row(idx);
            if ( NavPan.btns_first_row[idx].hasOwnProperty("res") ) {
                NavPan[ NavPan.btns_first_row[idx].res ]();
            }
        });
    },
    
    second_row: function(type) {
        var HTML = "";
        var btns = this.btns_second_row[type];
        
        if (type === 5) {
            /* zoom */
            for (var i = 0; i < IIPV.num_resolutions; i++) {
                btns[i+3].implemented = true;
            }
            for (var i = IIPV.num_resolutions; i < 7; i++) {
                btns[i+3].implemented = false;
            }
        }
        
        var ratios = this.ratios(btns);
        var btnHTML;
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].implemented) {
                btnHTML = "<div class=\"table-cell " + this.second_row_button_class + "\" style=\"width: " + ratios[i] * 100 + "%;\" name=\"" + btns[i].btn.replace(/\s+/g, '') + "-second-row-nav-btn\">" + btns[i].btn + "</div>";
            } else {
                btnHTML = "<div class=\"table-cell not-implemented " + this.second_row_button_class + "\" style=\"width: " + ratios[i] * 100 + "%;\" name=\"" + btns[i].btn.replace(/\s+/g, '') + "-second-row-nav-btn\">" + btns[i].btn + "</div>";
            }
            HTML += btnHTML;
        }
        $("#" + this.second_row_id).html(HTML);
        this.second_row_callback();
    },
    
    second_row_callback: function() {
        $("." + this.second_row_button_class).click(function() {
            if ($(this).hasClass("not-implemented")) {
                return;
            }
            
            var first_row = $("." + NavPan.first_row_button_class).index( $("." + NavPan.first_row_button_class + ".selected") );
            var second_row = $("." + NavPan.second_row_button_class).index(this);
            
            switch (first_row) {
                case 0:
                    /* file */
                    NavPan.select_second_row__button(0);
                    FileOpen.html();
                    IIPhistogram.hide();
                    FileOpen.show();
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    /* zoom */
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
                    break;
                case 6:
                    /* histogram */
                    IIPhistogram.trigger_contrast(second_row);
                    break;
                case 7:
                    /* color */
                    if (second_row === 13) {
                        /* invert colormap */
                        IIPhistogram.invert_color_map();
                    } else if (IIPhistogram.contrast < 0) {
                        if ($(this).hasClass("selected")) {
                            $(this).removeClass("selected");
                            Color.color = 0;
                            Color.remove();
                        } else {
                            $("." + NavPan.second_row_button_class).removeClass("selected");
                            $(this).addClass("selected");
                            Color.color = second_row;
                            Color.apply();
                        }
                    } else {
                        if ($(this).hasClass("selected")) {
                            $(this).removeClass("selected");
                            Color.color = 0;
                        } else {
                            $("." + NavPan.second_row_button_class).removeClass("selected");
                            $(this).addClass("selected");
                            Color.color = second_row;
                        }
                        Color.apply_with_contrast_on();
                    }
                    
                    break;
                case 8:
                    break;
                case 9:
                    break;
                case 10:
                    window.open("https://github.com/bho4/LSST");
                    break;
                default:
                    break;
            }
        });
    },
    
    restore_file_second_row: function() {
        if (FileOpen.is_visible()) {
            NavPan.select_second_row__button(0);
        }
    },
    
    restore_zoom_second_row: function() {
        this.deselect_second_row_buttons();
        this.select_second_row__button(IIPV.view.res + 3);
    },
    
    restore_histogram_second_row: function() {
        if (!IIPhistogram.is_visible()) {
            FileOpen.hide();
            IIPhistogram.show();
        }
        
        if (IIPhistogram.contrast >= 0) {
            this.toggle_second_row_button(IIPhistogram.contrast);
        }
    },
    
    restore_color_second_row: function() {
        if (Color.color > 0) {
            this.toggle_second_row_button(Color.color);
        }
    },
    
    is_histogram_panel_selected: function() {
        return $("." + this.first_row_button_class).index( $("." + this.first_row_button_class + ".selected") ) === 6;
    },
    
    is_room_panel_selected: function() {
        return $("." + this.first_row_button_class).index( $("." + this.first_row_button_class + ".selected") ) === 5;
    },
    
    deselect_first_row_buttons: function() {
        $("." + NavPan.first_row_button_class).removeClass("selected");
        $("." + NavPan.first_row_button_class).removeClass("stripe-btn");
    },
    
    deselect_second_row_buttons: function() {
        $("." + NavPan.second_row_button_class).removeClass("selected");
        $("." + NavPan.second_row_button_class).removeClass("stripe-btn");
    },
    
    select_first_row_button: function(idx) {
        $($("." + NavPan.first_row_button_class)[idx]).addClass("selected");
        $($("." + NavPan.first_row_button_class)[idx]).addClass("stripe-btn");
    },
    
    select_second_row__button: function(idx) {
        $($("." + NavPan.second_row_button_class)[idx]).addClass("selected");
        $($("." + NavPan.second_row_button_class)[idx]).addClass("stripe-btn");
    },
    
    toggle_second_row_button: function(idx) {
        $($("." + NavPan.second_row_button_class)[idx]).toggleClass("selected");
    }
};