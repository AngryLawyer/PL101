/**
 * A lookup table of pitches
 */
var pitchTable = {
    'c': 0,
    'd': 2,
    'e': 4,
    'f': 5,
    'g': 7,
    'a': 9,
    'b': 11
}; 

/**
 * Work out the Midi pitch of a note
 */
var calculatePitch = function(pitch) {
    var note = pitchTable[pitch.substring(0, 1)],
        octave = pitch.substring(1);

    return 12 + (12 * octave) + note;
};

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
    else if (expr.tag === 'seq')
    {
        return endTime(endTime(time, expr.left), expr.right);
    }
    else if (expr.tag === 'repeat')
    {
        return endTime(time, expr.section) * expr.count;
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
                pitch: calculatePitch(expr.pitch), 
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
    else if (expr.tag === 'repeat')
    {
        var constructed = [],
            newTime = time;

        //Forgive me, Functional Programming, for I have committed the sin of mutable state
        for (var i = 0; i < expr.count; ++i)
        {
            constructed = constructed.concat(compileWithTime(expr.section, newTime));
            newTime = endTime(newTime, expr.section);
        }

        return constructed;
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
            pitch: 'c4',
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
            pitch: 'e4',
            dur: 500 
        },
        right: { 
            tag: 'note',
            pitch: 'g4',
            dur: 500 
        } 
    }
};

var melody_mus_repeat = { 
    tag: 'seq',
    left: {
        tag: 'repeat',
        section: {
            tag: 'seq',
            left: {
                tag: 'note',
                pitch: 'c4',
                dur: 250 
            },
            right: { 
                tag: 'rest',
                dur: 250 
            }
        },
        count: 3
    },
    right: {
        tag: 'par',
        left: {
            tag: 'note',
            pitch: 'e4',
            dur: 500 
        },
        right: { 
            tag: 'note',
            pitch: 'g4',
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
console.log("\n");
console.log(melody_mus_repeat);
console.log("\n");
console.log(compile(melody_mus_repeat));
