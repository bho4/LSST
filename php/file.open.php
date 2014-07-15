<?php

$directory = $_GET["directory"];

if ( ($dirList = scandir($directory, 0)) == false ) {
    print_r(error_get_last());
} else {
    echo json_encode($dirList);
}
