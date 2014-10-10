<?php

//$url = $_GET["url"];
$url = "https://www.dropbox.com/s/6f2596sa6ua35n3/PalaisDuLouvre.tif?dl=0";


if (ini_get('allow_url_fopen') == 1) {
    echo '<p style="color: #0A0;">fopen is allowed on this host.</p>';
} else {
    echo '<p style="color: #A00;">fopen is not allowed on this host.</p>';
}

#$image = basename($url);
var_dump($url);

var_dump( file_get_contents($url) );
#$url = preg_replace('/www/', 'dl', $url, 1);
#$url = preg_replace('/dropbox/', 'dropboxusercontent', $url, 1);
//var_dump($url);
//$img = fopen($url);
//var_dump($img);

#file_put_contents("../../../../Server/Apache/fcgi-bin/srv-img-src/PalaisDuLouvre.tif", file_get_contents($url));

#echo $image;
