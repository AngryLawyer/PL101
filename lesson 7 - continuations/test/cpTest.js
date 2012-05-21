if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    //var lookup = require('../tortoise').lookup;
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
    //TODO: Fibonacci tests
});

suite('List lookup', function() {
    //TODO: list lookups
});

suite('List reversal', function() {
    //TODO: List reversal
});

suite('ASTs', function() {
});
