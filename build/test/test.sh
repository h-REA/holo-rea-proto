BINDIR=../../bin/HoloREA/ui
ZOMEFILE=../../src/zome-api-wrapper/zomes.js

cd ..
source bin.sh
cd test

../../node_modules/.bin/tsc --project ./src --outDir $BINDIR
cp ./src/chai/chai.js $BINDIR/chai/
cp ./src/*.js $BINDIR/
cp ./src/*.html $BINDIR/
cp ./src/*.css $BINDIR/
cp $ZOMEFILE $BINDIR/

cd ../../bin/HoloREA
hcdev web
