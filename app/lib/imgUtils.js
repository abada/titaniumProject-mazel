/*
 * http://blog.ivank.net/fastest-gaussian-blur.html

    var f = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "pic_carl.jpg"),
        blob = f.read(),
        blobStream = Ti.Stream.createStream({source:blob, mode: Ti.Stream.MODE_READ});
        
    Alloy.Globals.logDebug("blob length", blob.length, blob.width, blob.height);
    
    var bufferSrc = Ti.createBuffer({ length: blob.length }),
        bufferDst = Ti.createBuffer({ length: blob.length });
        
    var bytesRead = blobStream.read(bufferSrc);
    Alloy.Globals.logDebug(bytesRead + " bytes read");
    
    for (var i = 0; i < 10; i++) {
        Alloy.Globals.logDebug(i + ": " + bufferSrc[i]);
    }
    
    blob = $.matchOverlay.children[0].toBlob();
    blobStream = Ti.Stream.createStream({source:blob, mode: Ti.Stream.MODE_READ});
    
    bufferSrc = Ti.createBuffer({ length: blob.length });
        
    bytesRead = blobStream.read(bufferSrc);
    Alloy.Globals.logDebug(bytesRead + " bytes read");
    
    for (var i = 0; i < 10; i++) {
        Alloy.Globals.logDebug(i + ": " + bufferSrc[i]);
    }
    
        
    // var GaussianBlur = require("imgUtils"),
        // op = new GaussianBlur();
        
    // op.filter(bufferSrc, bufferDst, blob.width, blob.height, 3);    
    
    blobStream.close();
    blobStream = null;
    
    bufferSrc.release();
    bufferSrc = null;
    
    bufferDst.release();
    bufferDst = null;
    
    blob = null;
    f = null;
    */
function GaussianBlur() {
    
    function boxesForGauss(sigma, n)  // standard deviation, number of boxes
    {
        var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
        var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
        var wu = wl+2;
                   
        var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
        var m = Math.round(mIdeal);
        // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
                  
        var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
        return sizes;
    }
    
    function boxBlur (scl, tcl, w, h, r) {
        for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
        boxBlurH(tcl, scl, w, h, r);
        boxBlurT(scl, tcl, w, h, r);
    }
    function boxBlurH (scl, tcl, w, h, r) {
        var iarr = 1 / (r+r+1);
        for(var i=0; i<h; i++) {
            var ti = i*w, li = ti, ri = ti+r;
            var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
            for(var j=0; j<r; j++) val += scl[ti+j];
            for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
            for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
            for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
        }
    }
    function boxBlurT (scl, tcl, w, h, r) {
        var iarr = 1 / (r+r+1);
        for(var i=0; i<w; i++) {
            var ti = i, li = ti, ri = ti+r*w;
            var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
            for(var j=0; j<r; j++) val += scl[ti+j*w];
            for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
            for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
            for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
        }
    }
    
    /**
     * scl - source channel
     * tcl - target channel
     * w - width of image
     * h - height of image
     * r - radius of blur
     */
    this.filter = function (scl, tcl, w, h, r) {        
        var bxs = boxesForGauss(r, 3);
        boxBlur (scl, tcl, w, h, (bxs[0]-1)/2);
        boxBlur (tcl, scl, w, h, (bxs[1]-1)/2);
        boxBlur (scl, tcl, w, h, (bxs[2]-1)/2);
    };
    
}

module.exports = GaussianBlur;

