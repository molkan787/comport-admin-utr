const makeBuffer = len => Buffer.alloc(len)

// Constants was used for compress/decompress function.
var NBBY = 8,
    MATCH_BITS = 6,
    MATCH_MIN = 3,
    MATCH_MAX = ((1 << MATCH_BITS) + (MATCH_MIN - 1)),
    OFFSET_MASK = ((1 << (16 - MATCH_BITS)) - 1),
    LEMPEL_SIZE_BASE = 1024,
    EOF = -1;
// set C_COMPAT to true if you need to decompress with the (untweaked) C lzjb
// implementation, which breaks if offset==0; the javascript
// implementation uses 0 to indicate an offset of OFFSET_MASK+1.
var C_COMPAT = true;

/**
 * Compress string or byte array using fast and efficient algorithm.
 * @param {Array|Uint8Array|Buffer|stream} input The stream or byte array that you want to compress.
 * @param {stream} output Optional output stream.
 * @return {Array|Uint8Array|Buffer} Compressed byte array, or 'output'
 */
export const compressFile = function(inStream, outStream, props) {
    var sstart, dstart = [], slen,
        src = 0, dst = 0,
        cpy, copymap,
        mlen, offset,
        hash, hp,
        lempel,
        i, j;
    var retval;
    var LEMPEL_SIZE = LEMPEL_SIZE_BASE;
    var EXPAND = 1; // default to original C impl
    if (typeof(props)==='number') {
        LEMPEL_SIZE *= 2;
        props = Math.max(1, Math.min(9, props)) - 1;
        EXPAND = 1<<Math.floor(props/2);
        if (props&1) EXPAND = Math.round(EXPAND * 1.5);
        if (props >=2 && props <= 4) EXPAND++;
    }

    if (!('readByte' in inStream)) {
        var inBuffer = inStream;
        inStream = {
            size: inBuffer.length,
            pos: 0,
            readByte: function() {
                if (this.pos >= this.size) { return EOF; }
                return inBuffer[this.pos++];
            }
        };
    }
    if (!(outStream && 'writeByte' in outStream)) {
        outStream = {
            buffer: [],
            pos: 0,
            writeByte: function(_byte) { this.buffer[this.pos++] = _byte; }
        };
        retval = outStream.buffer;
    } else {
        retval = outStream;
    }

    // if we know the size, write it
    var fileSize;
    if ('size' in inStream && inStream.size >= 0) {
        fileSize = inStream.size;
    } else {
        fileSize = -1; // size unknown
    }

    var size = [], fs = (fileSize+1);
    do {
        size.push(fs & 0x7F);
        fs = Math.floor( fs / 128 ); // division instead of shift
    } while (fs !== 0);
    size[0] |= 0x80;
    for (i=size.length-1; i>=0; i--) {
        outStream.writeByte(size[i]);
    }
    size=null;

    // use Uint16Array if available
    if (typeof(Uint16Array) !== 'undefined') {
        // Uint16Array is automatically zero-filled
        lempel = new Uint16Array(LEMPEL_SIZE * EXPAND);
    } else {
        lempel = [];
        // Initialize lempel array.
        for(i = 0; i < LEMPEL_SIZE * EXPAND; i++)
            lempel[i] = 0;
    }

    var window = makeBuffer(OFFSET_MASK+1);
    var windowpos = 0;
    var winput = function(_byte) {
        window[windowpos++] = _byte;
        if (windowpos >= window.length) {
            windowpos = 0;
        }
        return _byte;
    };

    var outwindow = makeBuffer(17);
    var outpos = 0;
    var dumpout = function() {
        var i;
        for (i=0; i<outpos; i++) {
            outStream.writeByte(outwindow[i]);
        }
        outpos = 0;
    };

    var unbuffer = [];
    var get = function() {
        if (unbuffer.length)
            return unbuffer.pop();
        return inStream.readByte();
    };
    var unget = function(_byte) {
        unbuffer.push(_byte);
    };

    var copymask = 1 << (NBBY - 1);
    var matchpossibility = [];
    while (true) {
        var c1 = get();
        if (c1 === EOF) break;

        if ((copymask <<= 1) == (1 << NBBY)) {
            dumpout();
            copymask = 1;
            outwindow[0] = 0;
            outpos = 1;
        }

        var c2 = get();
        if (c2 === EOF) {
            outwindow[outpos++] = winput(c1);
            break;
        }
        var c3 = get();
        if (c3 === EOF) {
            outwindow[outpos++] = winput(c1);
            unget(c2);
            continue;
        }

        hash = (c1 << 16) + (c2 << 8) + c3;
        hash ^= (hash >> 9);
        hash += (hash >> 5);
        hash ^= c1;
        hp = (hash & (LEMPEL_SIZE - 1)) * EXPAND;
        matchpossibility.length = 0;
        for (j=0; j<EXPAND; j++) {
            offset = (windowpos - lempel[hp+j]) & OFFSET_MASK;
            cpy = window.length + windowpos - offset;
            var w1 = window[cpy & OFFSET_MASK];
            var w2 = window[(cpy+1) & OFFSET_MASK];
            var w3 = window[(cpy+2) & OFFSET_MASK];
            // if offset is small, we might not have copied the tentative
            // bytes into the window yet.  (Note that offset=0 really means
            // offset=(OFFSET_MASK+1).)
            if (C_COMPAT && offset===0) {
                w1 = c1 ^ 1; // ensure match will fail
            } else if (offset==1) { w2 = c1; w3 = c2; }
            else if (offset==2) { w3 = c1; }
            if (c1 === w1 && c2 === w2 && c3 === w3) {
                matchpossibility.push(offset);
            }
        }
        // store this location in the hash, move the others over to make room
        // oldest match drops off
        for (j=EXPAND-1; j>0; j--)
            lempel[hp+j] = lempel[hp+j-1];
        lempel[hp] = windowpos;
        // did we find any matches?
        if (matchpossibility.length === 0) {
            outwindow[outpos++] = winput(c1);
            unget(c3);
            unget(c2);
        } else {
            // find the longest of the possible matches
            outwindow[0] |= copymask;
            winput(c1); winput(c2); winput(c3);
            var c4 = get(), last = matchpossibility[0];
            var base = window.length + windowpos;
            for (mlen = MATCH_MIN; mlen < MATCH_MAX; mlen++, base++) {
                if (c4 === EOF) break;
                for (j=0; j < matchpossibility.length; ) {
                    var w4 = window[(base - matchpossibility[j]) & OFFSET_MASK];
                    if (c4 !== w4) {
                        last = matchpossibility[j];
                        matchpossibility.splice(j, 1);
                    } else {
                        j++;
                    }
                }
                if (matchpossibility.length===0) break; // no more matches
                winput(c4);
                c4 = get();
            }
            if (matchpossibility.length !== 0) {
                // maximum length match, rock on!
                last = matchpossibility[0];
            }
            unget(c4);

            outwindow[outpos++] = ((mlen - MATCH_MIN) << (NBBY - MATCH_BITS)) |
                (last >> NBBY);
            outwindow[outpos++] = last & 0xFF;
        }
    }
    dumpout();

    return retval;
};

/**
 * Decompress string or byte array using fast and efficient algorithm.
 * @param {Array|Uint8Array|Buffer|stream} input The stream or byte array that you want to decompress.
 * @param {stream} output Optional output stream.
 * @return {Array|Uint8Array|Buffer} Decompressed byte array, or 'output'
 */
export const decompressFile = function(inStream, outStream) {
    var sstart, dstart = [], slen,
        src = 0, dst = 0,
        cpy, copymap,
        mlen, offset,
        i, c;
    var retval;

    var window = makeBuffer(OFFSET_MASK+1);
    var windowpos = 0;

    if (!('readByte' in inStream)) {
        var inBuffer = inStream;
        inStream = {
            size: inBuffer.length,
            pos: 0,
            readByte: function() {
                if (this.pos >= this.size) { return EOF; }
                return inBuffer[this.pos++];
            }
        };
    }
    // read size from stream
    var outSize = 0;
    while (true) {
        c = inStream.readByte();
        if (c&0x80) { outSize |= (c & 0x7f); break; }
        outSize = (outSize | c) * 128;// * instead of << allows sizes up to 2^53
    }
    outSize -= 1; // outSize = -1 means, "size unknown"

    if (!(outStream && 'writeByte' in outStream)) {
        outStream = {
            buffer: (outSize >= 0) ? makeBuffer(outSize) : [],
            pos: 0,
            writeByte: function(_byte) { this.buffer[this.pos++] = _byte; }
        };
        retval = outStream.buffer;
    } else {
        retval = outStream;
    }

    var copymask = 1 << (NBBY - 1);

    while (outSize !== 0) {
        c = inStream.readByte();
        if (c === EOF) break;

        if ((copymask <<= 1) == (1 << NBBY)) {
            copymask = 1;
            copymap = c;
            c = inStream.readByte();
        }
        if (copymap & copymask) {
            mlen = (c >> (NBBY - MATCH_BITS)) + MATCH_MIN;
            offset = ((c << NBBY) | inStream.readByte()) & OFFSET_MASK;
            cpy = windowpos - offset;
            if (cpy < 0) cpy += window.length;
            if (outSize >= 0) outSize -= mlen;
            while (--mlen >= 0) {
                c = window[windowpos++] = window[cpy++];
                outStream.writeByte(c);
                if (windowpos >= window.length) { windowpos=0; }
                if (cpy >= window.length) { cpy = 0; }
            }
        } else {
            outStream.writeByte(c);
            window[windowpos++] = c;
            if (windowpos >= window.length) { windowpos=0; }
            if (outSize >= 0) outSize--;
        }
    }
    return retval;
};
