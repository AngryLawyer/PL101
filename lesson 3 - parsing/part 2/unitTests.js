// Unit tests for Mus 

var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs');

var parser = fs.readFileSync('mus.peg', 'utf-8');

console.log(parser);

var parse = PEG.buildParser(parser).parse;

// Unit tests here!
console.log('----- Unit tests -----');

//Check single notes are something sensible
assert.deepEqual( parse('do', 'note'), {tag: 'note', pitch: 'c4', dur: 250});
assert.deepEqual( parse('do\n', 'note'), {tag: 'note', pitch: 'c4', dur: 250});
assert.deepEqual( parse('re', 'note'), {tag: 'note', pitch: 'd4', dur: 250});
assert.deepEqual( parse('mi', 'note'), {tag: 'note', pitch: 'e4', dur: 250});
assert.deepEqual( parse('fa', 'note'), {tag: 'note', pitch: 'f4', dur: 250});
assert.deepEqual( parse('sol', 'note'), {tag: 'note', pitch: 'g4', dur: 250});
assert.deepEqual( parse('la', 'note'), {tag: 'note', pitch: 'a4', dur: 250});
assert.deepEqual( parse('ti', 'note'), {tag: 'note', pitch: 'b4', dur: 250});

assert.deepEqual( parse('do/500', 'note'), {tag: 'note', pitch: 'c4', dur: 500});
assert.deepEqual( parse('do[5]', 'note'), {tag: 'note', pitch: 'c5', dur: 250});
assert.deepEqual( parse('do[5]/500', 'note'), {tag: 'note', pitch: 'c5', dur: 500});

//Rests
assert.deepEqual( parse('breathe', 'rest'), {tag: 'rest', dur: 250});
assert.deepEqual( parse('breathe/500', 'rest'), {tag: 'rest', dur: 500});

//Sequences
assert.deepEqual( parse('do\nre'), {tag: 'seq', left: {tag: 'note', pitch: 'd4', dur: 250}, right: {tag: 'note', pitch: 'c4', dur:250}});

//Comments
assert.deepEqual( parse('do%LOL'), {tag: 'note', pitch: 'c4', dur: 250});
assert.deepEqual( parse('do %LOL'), {tag: 'note', pitch: 'c4', dur: 250});
assert.deepEqual( parse('re %LOL do'), {tag: 'note', pitch: 'd4', dur: 250});
assert.deepEqual( parse('re %LOL\ndo'), {tag: 'seq', left: {tag: 'note', pitch: 'd4', dur: 250}, right: {tag: 'note', pitch: 'c4', dur:250}});


console.log('----- All tests passed -----');
