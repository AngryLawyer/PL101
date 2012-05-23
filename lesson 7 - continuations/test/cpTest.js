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

suite('Lists', function() {
    var smallList = generateList(10);
    var bigList = generateList(20000);

    test('length', function() {
        assert.deepEqual(listLength(smallList), 10);
        assert.deepEqual(listLength(bigList), 20000);
    });

    test('lookup', function() {
        assert.deepEqual(listLookup(8, smallList), 9);
        assert.deepEqual(listLookup(18670, bigList), 18671);
    });

    test('reversal', function() {
        var bigReverse = listReverse(bigList);

        assert.deepEqual(listLookup(0, bigReverse), 20000);
    });
});
