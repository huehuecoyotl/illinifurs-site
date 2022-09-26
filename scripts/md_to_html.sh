#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

php ${SCRIPT_DIR}/php-markdown/parser.php $1 $2

sed -i.sav -e 's/<p>\(<img .*>\)<\/p>/\1/g' $2
sed -i.sav -e 's/<h6>/<div class="caption">/g' $2
sed -i.sav -e 's/<\/h6>/<\/div>/g' $2
sed -i.sav -e 's/alt=/title=/g' $2
sed -i.sav -e 's/<p>\(<%[^>]*>\)<\/p>/\1/g' $2
sed -i.sav -e '
/<\/blockquote>/ {
    N
    s/<\/blockquote>\n<blockquote>/<\/blockquote><blockquote>/
}' $2
sed -i.sav -e '
/<\/blockquote><blockquote>/ {
    D
}' $2

rm $2.sav
