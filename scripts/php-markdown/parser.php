<?php

require_once dirname(__FILE__) . '/Michelf/MarkdownExtra.inc.php';

$infile = fopen($argv[1], "r");
$text = fread($infile, filesize($argv[1]));
fclose($infile);

use Michelf\MarkdownExtra;
$html = MarkdownExtra::defaultTransform($text);

$outfile = fopen($argv[2], "w");
fwrite($outfile, $html);
fclose($outfile);

?>
