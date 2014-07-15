var ROOT = '/Server/Apache/fcgi-bin/srv-img-src/';
//var ROOT = '/srv/iipsrv/srv-img-src/';
var SERVER = '/fcgi-bin/IIPImageServer.fcgi';
//var SERVER = '../../iipsrv/iipsrv.fcgi';
var DEFAULT_IMAGE = 'raft.tif';
//var DEFAULT_IMAGE = 'output1.tif';
$(document).ready(function() {
    if (window.innerWidth >= 1920) {
        $("body").css("font-size", "125%");
        $(".target-viewport-width").css("width", "1600px");
        $("div#right-div").css("height", "585px");
    }
    
    var dif = window.innerWidth - document.body.clientWidth;
    if (dif > 0) {
        dif /= 2;
        document.body.style.margin = "12px " + dif + "px 8px " + dif + "px";
    } else {
        document.body.style.margin = "8px 8px 8px 8px";
    }
    
    FileOpen.init();
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
});