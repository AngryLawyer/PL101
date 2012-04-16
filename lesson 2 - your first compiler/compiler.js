/**
 * Calculate when a tree of notes will end
 */
var endTime = function(time, expr) {
    
    if (expr.tag === 'note' || expr.tag === 'rest')
    {
        return time + expr.dur;
    }
    else if (expr.tag === 'par')
    {
        // We need to get the length of the longest one
        return Math.max(endTime(time, expr.left), endTime(time, expr.right));
    }
    else
    {
        return endTime(endTime(time, expr.left), expr.right);
    }
};

/**
 * Add starting times to each 
 */
var compileWithTime = function (expr, time) {
    if (expr.tag === 'note')
    {
        return [ 
            { 
                tag: 'note',
                pitch: expr.pitch, 
                dur: expr.dur,
                start: time
            }
        ];
    }
    else if (expr.tag === 'rest')
    {
        return [
            {
                tag: 'rest',
                dur: expr.dur,
                start: time
            }
        ];
    }
    else if (expr.tag === 'seq')
    {
        return compileWithTime(expr.left, time)
            .concat(compileWithTime(expr.right, endTime(time, expr.left)));
    }
    else if (expr.tag === 'par')
    {
        return compileWithTime(expr.left, time).concat(compileWithTime(expr.right, time));
    }
};

var compile = function (musexpr) {
    return compileWithTime(musexpr, 0);
};

var playMUS = function (musexpr) {
    playNOTE(compile(musexpr));
};

var melody_mus = { 
    tag: 'seq',
    left: {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'a4',
            dur: 250 
        },
        right: { 
            tag: 'note',
            pitch: 'b4',
            dur: 250 
        }
    },
    right: {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'c4',
            dur: 500 
        },
        right: { 
            tag: 'note',
            pitch: 'd4',
            dur: 500 
        } 
    }
};

var melody_mus_par = { 
    tag: 'seq',
    left: {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'a4',
            dur: 250 
        },
        right: { 
            tag: 'note',
            pitch: 'b4',
            dur: 250 
        }
    },
    right: {
        tag: 'par',
        left: {
            tag: 'note',
            pitch: 'c4',
            dur: 500 
        },
        right: { 
            tag: 'note',
            pitch: 'd4',
            dur: 500 
        } 
    }
};

var melody_mus_rest = { 
    tag: 'seq',
    left: {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'a4',
            dur: 250 
        },
        right: { 
            tag: 'rest',
            dur: 250 
        }
    },
    right: {
        tag: 'par',
        left: {
            tag: 'note',
            pitch: 'c4',
            dur: 500 
        },
        right: { 
            tag: 'note',
            pitch: 'd4',
            dur: 500 
        } 
    }
};

console.log(melody_mus);
console.log("\n");
console.log(compile(melody_mus));
console.log("\n");
console.log(melody_mus_par);
console.log("\n");
console.log(compile(melody_mus_par));
console.log("\n");
console.log(melody_mus_rest);
console.log("\n");
console.log(compile(melody_mus_rest));
