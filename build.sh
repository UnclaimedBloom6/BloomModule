#!/bin/bash

cd "$(dirname "$0")"

rm -rf out/

mkdir out
mkdir out/Bloom

rsync -av --exclude-from=".gitignore"\
    --exclude="*.git*"\
    --exclude="README.md"\
    --exclude="build.sh"\
    * out/Bloom/

cd out/
zip -r Bloom.zip Bloom/
rm -rf Bloom
