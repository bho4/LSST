//var ROOT = '/Server/Apache/fcgi-bin/srv-img-src/';
//var SERVER = '/fcgi-bin/IIPImageServer.fcgi';

var ROOT = '/srv/iipsrv/srv-img-src/';
var SERVER = '../../iipsrv/iipsrv.fcgi';

var DEFAULT_IMAGE = 'raft.tif';
$(document).ready(function(){
    init_viewer();
});

function init_viewer() {
    if ( self !== top ) {
        parent.IIPV = new IIPMooViewer("viewer", {
            server: parent.SERVER,
            image: parent.ROOT + parent.DEFAULT_IMAGE,
            prefix: "icon/iipmooviewer/",
            navigation: {
                buttons: ['zoomOut', 'zoomIn'] 
            },
            winResize: false,
            preload: false
        });
    } else {
        new IIPMooViewer("viewer", {
            server: SERVER,
            image: ROOT + DEFAULT_IMAGE,
            prefix: "icon/iipmooviewer/",
            navigation: {
                buttons: ['zoomOut', 'zoomIn'] 
            },
            winResize: false,
            preload: false
        });
    }
}