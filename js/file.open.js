var FileOpen = {
    html: function() {
        var HTML = "";
        HTML += "<div id=\"choose-image-on-server\">Open an Image on Server</div>";
        $.ajax({
            type: "GET",
            url: "php/file.open.php",
            data: {directory: ROOT},
            async: false,
            dataType: "json",
        }).success(function(data) {
            if (data.length === 2) {
                // No Image
            } else {
                var curImage = $("#info-div #file-name").text();
                HTML += '<div class="table" style="width: 100%; margin-top: 20px;">';
                HTML += '<div class="table-row">';
                for (var i = 2; i < data.length; i++) {
                    if (i !== 2 && (i-2) % 3 === 0) {
                        HTML += '</div></div>';
                        HTML += '<div class="table" style="width: 100%; margin-top: 10px;">';
                        HTML += '<div class="table-row">';
                    }
                    if (data[i] === curImage) {
                        HTML += "<div class=\"table-cell image-on-server selected stripe-btn\">" + data[i] + "</div>";
                    } else {
                        HTML += "<div class=\"table-cell image-on-server\">" + data[i] + "</div>";
                    }
                    
                    if ( (i + 1) !== data.length && (i-1) % 3 !== 0) {
                        HTML += '<div class="table-cell table-margin" style="width: 1%;"></div>';
                    }
                }
                HTML += '</div></div>';
                
                HTML += '<div id="upload-image-to-server" style="margin-top: 15px;">Upload an Image to Server</div>';
                HTML += '<div class="table" style="width: 100%; margin-top: 15px;">';
                HTML += '<div class="table-row">';
                HTML += '<div id="input-container"><input placeholder="please enter the URL of your image here, then click the button on the bottom left corner" name="image-url"></div>';
                HTML += '</div></div>';
                HTML += '<div class="table" style="width: 100%; margin-top: 5px;">';
                HTML += '<div class="table-row">';
                HTML += '<div id="upload-image-btn" class="table-cell"><i class="fa fa-cloud-upload"></i></div>';
                HTML += '<div class="table-cell table-margin" style="width: 1%;"></div>';
                HTML += '<div id="erase-input-url-btn" class="table-cell"><i class="fa fa-eraser"></i></div>';
                HTML += '</div></div>';
            }
        });
        $("#right-div #file-open-div").html( HTML );
        this.open_image_on_server_callback();
        this.upload_image_to_server_callback();
    },
    
    change_image: function(newImage) {
        var viewer = $("#iip-frame").contents().find("#viewer");
        $(viewer).empty();
        $("#panner .navcontainer").empty();
        DEFAULT_IMAGE = newImage;
        document.getElementById('iip-frame').contentWindow.init_viewer();
        $("#info-div #file-name").text(DEFAULT_IMAGE);
    },
    
    open_image_on_server_callback: function() {
        $("#file-open-div .image-on-server").click(function() {
            if ($(this).hasClass("selected")) {
                return;
            }
            FileOpen.change_image($(this).text());
            $("#file-open-div .image-on-server").removeClass("selected");
            $("#file-open-div .image-on-server").removeClass("stripe-btn");
            $(this).addClass("selected");
            $(this).addClass("stripe-btn");
        });
    },
    
    upload_image_to_server_callback: function() {
        $("#file-open-div #erase-input-url-btn").addClass("disabled");
        $("#file-open-div #upload-image-btn").addClass("disabled");
        
        $("#file-open-div #erase-input-url-btn").click(function() {
            $('#file-open-div input[name="image-url"]').val("");
            $("#file-open-div #erase-input-url-btn").addClass("disabled");
            $("#file-open-div #upload-image-btn").addClass("disabled");
        });
        
        $('#file-open-div input[name="image-url"]').on('input', function() {
            if ($('#file-open-div input[name="image-url"]').val().length === 0) {
                $("#file-open-div #erase-input-url-btn").addClass("disabled");
                $("#file-open-div #upload-image-btn").addClass("disabled");
            } else {
                $("#file-open-div #erase-input-url-btn").removeClass("disabled");
                $("#file-open-div #upload-image-btn").removeClass("disabled");
            }
        });
        
        $("#file-open-div #upload-image-btn").click(function() {
            if ($(this).hasClass("disabled"))
                return;
            
            $("#file-open-div #upload-image-btn").addClass("disabled");
            
            var url = $('#file-open-div input[name="image-url"]').val();
//            url = url.substring(0, url.indexOf('?'));
//            console.log(url);
            
            if (FileOpen.is_url(url)) {
                $("#panner .navcontainer").fadeOut(1000);
                $("iframe#iip-frame").fadeOut(1000, function() {
                    $.ajax({
                        type: "GET",
                        url: "php/upload.image.php",
                        data: {url: url},
                    }).success(function(imageName) {
                        console.log(imageName);
                        FileOpen.change_image(imageName);
                        if ( $("#right-div #file-open-div").css("display") !== "none") {
                            FileOpen.html();
                        }
                        $("iframe#iip-frame").fadeIn("fast");
                        $("#panner .navcontainer").fadeIn("fast");
                    });
                });
            } else {
                //console.log("Not a valid URL.");
            }
        });
    },
    
    is_url: function(url) {
        return url !== "";
    },
    
    is_visible: function() {
        return $("#right-div #file-open-div").css("display") !== "none";
    },
    
    show: function() {
        $("#right-div #file-open-div").fadeIn(1000);
    },
    
    hide: function() {
        $("#right-div #file-open-div").hide();
    }
};