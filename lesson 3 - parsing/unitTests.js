// Unit tests for scheem

var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs');

var parser = fs.readFileSync('scheem.peg', 'utf-8');

console.log(parser);

var parse = PEG.buildParser(parser).parse;

// Unit tests here!
console.log('----- Unit tests -----');

// Assert single atoms work
assert.deepEqual( parse('wugahumphdamumph'), 'wugahumphdamumph' );

// Assert single item expressions work
assert.deepEqual( parse('(1)'), ['1']);

// Assert multiple item expressions work
assert.deepEqual( parse('(* 1 2)'), ['*', '1', '2'] );

// Assert nested expressions work
assert.deepEqual( parse('(* (* 1 2) 3)'), ['*', ['*', '1', '2'], '3'] );

// Assert double nested expressions work
assert.deepEqual( parse('(* (* 1 2) (* 1 2))'), ['*', ['*', '1', '2'], ['*', '1', '2'] ] );

// Assert silly amounts of whitespace
assert.deepEqual( parse('( * (* 1    2)    (  * 1 2     ))'), ['*', ['*', '1', '2'], ['*', '1', '2'] ] );

// Assert newlines and tabs
assert.deepEqual( parse('( * \n(* 1\t2)(  * 1 2   \r\n  ))'), ['*', ['*', '1', '2'], ['*', '1', '2'] ] );

// Assert basic quotes
assert.deepEqual( parse("'x"), ['quote', 'x'] );

// Assert nested quotes
assert.deepEqual( parse("('x '(1 2 '3))"), [['quote', 'x'], ['quote', ['1', '2', ['quote', '3']]]] );

// Assert comments
assert.deepEqual( parse(";;lol comment\nx"), 'x' );

// Assert comments with valid syntax inside
assert.deepEqual( parse(";;lol comment (1, 2, 3)\n(x, y)"), ['x', 'y'] );

// Assert strings
assert.deepEqual( parse('(concat "This is a string" "This is (another) string")'), ["This is a string", "This is (another) string"]);

console.log('----- All tests passed -----');
