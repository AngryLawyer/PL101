if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var evalScheem = require('../scheem').evalScheem;
    var expect = require('chai').expect;

} else {
    // In browser assume already loaded by <script> tags
    var assert = chai.assert;
    var expect = chai.expect;
}

suite('numbers', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(3, {}),
            3
        );
    });
    test('zero', function() {
        assert.deepEqual(
            evalScheem(0, {}),
            0
        );
    });

    test('a negative number', function() {
        assert.deepEqual(
            evalScheem(-1, {}),
            -1
        );
    });
});

suite('basic operations', function() {
    test('addition', function() {
        assert.deepEqual(
            evalScheem(['+', 1, 2], {}), 
            3
        );
    });

    test('nested addition', function() {
        assert.deepEqual(
            evalScheem(['+', 1, ['+', 3, 4]], {}), 
            8
        );
    });

    test('variadic addition', function() {
        assert.deepEqual(
            evalScheem(['+', 1, 2, 3], {}), 
            6
        );
    });

    test('subtraction', function() {
        assert.deepEqual(
            evalScheem(['-', 2, 1], {}), 
            1
        );
    });

    test('nested subtraction', function() {
        assert.deepEqual(
            evalScheem(['-', 10, ['-', 2, 1]], {}), 
            9
        );
    });

    test('variadic subtraction', function() {
        assert.deepEqual(
            evalScheem(['-', 5, 2, 3], {}), 
            0
        );
    });

    test('multiplication', function() {
        assert.deepEqual(
            evalScheem(['*', 3, 2], {}), 
            6
        );
    });

    test('nested multiplication', function() {
        assert.deepEqual(
            evalScheem(['*', 2, ['*', 3, 4]], {}), 
            24
        );
    });

    test('variadic multiplication', function() {
        assert.deepEqual(
            evalScheem(['*', 2, 2, 3], {}), 
            12
        );
    });

    test('division', function() {
        assert.deepEqual(
            evalScheem(['/', 6, 2], {}), 
            3
        );
    });

    test('nested division', function() {
        assert.deepEqual(
            evalScheem(['/', 10, ['/', 4, 2]], {}), 
            5
        );
    });

    test('variadic division', function() {
        assert.deepEqual(
            evalScheem(['/', 20, 2, 2], {}), 
            5
        );
    });

    test('modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 5, 2], {}), 
            1
        );
    });

    test('nested modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 5, ['%', 5, 3]], {}), 
            1
        );
    });

    test('variadic modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 10, 7, 2], {}), 
            1
        );
    });
});

suite('variables', function() {
    
    test('define valid', function() {
        var env = {};
        
        assert.deepEqual(
            evalScheem(['define', 'x', 10], env),
            0
        );

        assert.deepEqual(
            evalScheem(env, {'x': 10}),
            env
        );
    });

    test('define invalid', function() {
        var env = {'x': 10};
        expect(function() {
            evalScheem(['define', 'x', 10], env);
        }).to.throw();
    });

    test('set! valid', function() {
        var env = {'x': 20};
        
        assert.deepEqual(
            evalScheem(['set!', 'x', 10], env),
            0
        );

        assert.deepEqual(
            evalScheem(env, {'x': 10}),
            env
        );
    });

    test('set! invalid', function() {
        var env = {};
        expect(function() {
            evalScheem(['set!', 'x', 10], env);
        }).to.throw();
    });

    //Read
    test('read', function() {
        var env = {'x': 20};
        
        assert.deepEqual(
            evalScheem('x', env),
            20
        );
    });
});

suite('begin', function() {

    test('single begin', function() {
        assert.deepEqual(
            evalScheem(['begin', 4], {}),
            4
        );
    });

    test('multi begin', function() {
        assert.deepEqual(
            evalScheem(['begin', 4, 5, 6], {}),
            6
        );
    });

    test('preserve', function() {
        assert.deepEqual(
            evalScheem(['begin', ['define', 'x', 10], 'x'], {}),
            10
        );
    });
});

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });

    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });

    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });

    test('nested list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, ['quote', 3, 4]]], {}),
            [1, 2, ['quote', 3, 4]]
        );
    });
});

suite('comparators', function() {

    test('= true', function() {
        assert.deepEqual(
            evalScheem(['=', 3, 3], {}),
            '#t'
        );
    });

    test('= false', function() {
        assert.deepEqual(
            evalScheem(['=', 3, 4], {}),
            '#f'
        );
    });

    test('< true', function() {
        assert.deepEqual(
            evalScheem(['<', 3, 4], {}),
            '#t'
        );
    });

    test('< false', function() {
        assert.deepEqual(
            evalScheem(['<', 3, 3], {}),
            '#f'
        );
    });

    test('> true', function() {
        assert.deepEqual(
            evalScheem(['>', 4, 3], {}),
            '#t'
        );
    });

    test('> false', function() {
        assert.deepEqual(
            evalScheem(['>', 3, 3], {}),
            '#f'
        );
    });

    test('<= true', function() {
        assert.deepEqual(
            evalScheem(['<=', 3, 3], {}),
            '#t'
        );
    });

    test('<= false', function() {
        assert.deepEqual(
            evalScheem(['<=', 3, 2], {}),
            '#f'
        );
    });

    test('>= true', function() {
        assert.deepEqual(
            evalScheem(['>=', 3, 3], {}),
            '#t'
        );
    });

    test('>= false', function() {
        assert.deepEqual(
            evalScheem(['>=', 2, 3], {}),
            '#f'
        );
    });

    test('if true', function() {
        assert.deepEqual(
            evalScheem(['if', ['>', 3, 2], ['quote', 'first'], ['quote', 'second']], {}),
            'first'
        );
    });

    test('if false', function() {
        assert.deepEqual(
            evalScheem(['if', ['>', 2, 3], ['quote', 'first'], ['quote', 'second']], {}),
            'second'
        );
    });
});

suite('lists', function() {

    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons', 3, ['quote', [4, 5]]], {}),
            [3, 4, 5]
        );
    });

    test('car', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', [4, 5]]], {}),
            4
        );
    });

    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [4, 5]]], {}),
            [5]
        );
    });
});
