<?php

$url = $_GET["url"];

$image = basename($url);

$url = preg_replace('/www/', 'dl', $url, 1);
$url = preg_replace('/dropbox/', 'dropboxusercontent', $url, 1);

file_put_contents("../../../iipsrv/srv-img-src/$image", file_get_contents($url));

echo $image;
