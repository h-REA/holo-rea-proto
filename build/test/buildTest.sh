BINDIR=../../bin/HoloREA/ui
../../node_modules/.bin/tsc --project ./src --outDir $BINDIR
cp ./src/chai/chai.js $BINDIR/chai/
cp ./src/*.js $BINDIR/
cp ./src/*.html $BINDIR/
cp ./src/*.css $BINDIR/
