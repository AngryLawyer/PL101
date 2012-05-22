if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var nodeCount = require('../cp').nodeCount;
    var nodeInsert = require('../cp').nodeInsert;
    var fib = require('../cp').fib;
    var generateList = require('../cp').generateList;
    var listLength = require('../cp').listLength;
    var listLookup = require('../cp').listLookup;
    var listReverse = require('../cp').listReverse;

} else {
    // In browser assume loaded by <script>
    var assert = chai.assert;
}

suite('binary search tree', function() {
    test('single node', function() {
        assert.deepEqual(nodeCount({data: 'b', left: null, right: null}), 1);
    });

    test('small tree', function() {
        assert.deepEqual(nodeCount({data: 'a', left: {data: 'b', left: null, right: null}, right: {data: 'c', left: null, right: null}}), 3);
    });

    test('odd tree', function() {
        assert.deepEqual(nodeCount({
            data: 'a', 
            left: {
                data: 'b',
                left: {data: 'd', left: null, right: null},
                right: {data: 'e', left: null, right: null}
            },
            right: {
                data: 'c',
                left: null,
                right: null
            }
        }), 5);
    });

    test('inserts', function() {
        assert.deepEqual(nodeInsert('f', {
            data: 'd', 
            left: {
                data: 'b',
                left: {data: 'a', left: null, right: null},
                right: {data: 'c', left: null, right: null}
            },
            right: {
                data: 'g',
                left: null,
                right: null
            }
        }), {
            data: 'd', 
            left: {
                data: 'b',
                left: {data: 'a', left: null, right: null},
                right: {data: 'c', left: null, right: null}
            },
            right: {
                data: 'g',
                left: {data: 'f', left: null, right: null},
                right: null
            }
        });
    });
});

suite('Fibonacci', function() {
    test('small number', function() {
        assert.deepEqual(fib(1), 1);
        assert.deepEqual(fib(2), 1);
        assert.deepEqual(fib(3), 2);
        assert.deepEqual(fib(4), 3);
        assert.deepEqual(fib(5), 5);
        assert.deepEqual(fib(6), 8);
    });

    test('Large number', function() {
        assert.deepEqual(fib(32), 2178309);
    });
});

suite('Lists lookup', function() {
    var smallList = generateList(10);
    var bigList = generateList(20000);

    test('list length', function() {
        assert.deepEqual(listLength(smallList), 10);
        assert.deepEqual(listLength(bigList), 20000);
    });

    test('list lookup', function() {
        assert.deepEqual(listLookup(8, smallList), 8);
        assert.deepEqual(listLookup(18670, bigList), 18670);
    });

    test('list reversal', function() {
        var bigReverse = listReverse(bigList);

        assert.deepEqual(listLookup(1, bigReverse), 20000);
    });
});
