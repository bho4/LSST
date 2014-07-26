var ROOT = '/Server/Apache/fcgi-bin/srv-img-src/';
var SERVER = '/fcgi-bin/IIPImageServer.fcgi';

//var ROOT = '/srv/iipsrv/srv-img-src/';
//var SERVER = '../../iipsrv/iipsrv.fcgi';

var DEFAULT_IMAGE = 'raft.tif';

$(document).ready(function() {
    //alert(window.innerWidth);
    if (window.innerWidth >= 1920) {
        $(".target-viewport-width").css("width", "1536px");
        $("div#info-div").css("font-size", "19px");
        $("div#nav-pan-first-row").css("font-size", "19px");
        $("div#nav-pan-second-row").css("font-size", "19px");
        $("div#right-div").css("font-size", "19px");
        $("div#right-div").css("height", "580px");
        IIPhistogram.margins = [{top: 25, right: 22, bottom: 34, left: 48}, {top: 34, right: 42, bottom: 34, left: 48}];
        $("div#image-pixel-histogram div#histogram-svg-div").css("font-size", "13px");
    } else if (window.innerWidth >= 1536) {
        $(".target-viewport-width").css("width", "1280px");
        $("div#info-div").css("font-size", "15px");
        $("div#nav-pan-first-row").css("font-size", "15px");
        $("div#nav-pan-second-row").css("font-size", "15px");
        $("div#right-div").css("font-size", "15px");
        $("div#right-div").css("height", "490px");
        IIPhistogram.margins = [{top: 17, right: 16, bottom: 26, left: 42}, {top: 28, right: 38, bottom: 26, left: 42}];
        $("div#image-pixel-histogram div#histogram-svg-div").css("font-size", "11px");
    }
    
    var dif = window.innerWidth - document.body.clientWidth;
    if (dif > 0) {
        //alert(dif / 2);
        dif /= 2;
        document.body.style.margin = "8px " + dif + "px 8px " + dif + "px";
    } else {
        document.body.style.margin = "8px 8px 8px 8px";
    }
    
    NavPan.init();
    IIPhistogram.init();
    
    $("#left-div").html( "<iframe id=\"iip-frame\" src=\"iip.frame.html\"></iframe>" );
    $("#info-div #file-name").text(DEFAULT_IMAGE);
    
    $("body").css("visibility", "visible");
    
    $(window).bind('resize', function() {
        document.body.style.visibility = "hidden";
        if (window.RT) clearTimeout(window.RT);
        window.RT = setTimeout(function() {
            this.location.reload(false); /* false to get page from cache */
        }, 100);
    });
    
    $("#adjuster").click(function() {
        $("div#right-div #histogram-svg-div").empty();
        $("div#left-div").toggleClass("three");
        $("div#right-div").toggleClass("seven");
        IIPhistogram.width = $("div#right-div").width();
        LinearContrast.init();
        LinearContrast.reset();
        LogContrast.init();
        LogContrast.reset();
        FileOpen.change_image(DEFAULT_IMAGE);
    });            
});