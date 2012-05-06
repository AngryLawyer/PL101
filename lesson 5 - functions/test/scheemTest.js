if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var evalScheem = require('../scheem').evalScheem;
    var evalScheemString = require('../scheem').evalScheemString;
    var SCHEEM = require('../parser').SCHEEM;
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

    test('invalid addition', function() {
        expect(function() {
            evalScheem(['+', 1], {});
        }).to.throw();
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

    test('invalid addition', function() {
        expect(function() {
            evalScheem(['-', 1], {});
        }).to.throw();
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

    test('invalid multiplication', function() {
        expect(function() {
            evalScheem(['*', 1], {});
        }).to.throw();
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

    test('invalid division', function() {
        expect(function() {
            evalScheem(['/', 1], {});
        }).to.throw();
    });

    test('modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 5, 2], {}), 
            1
        );
    });

    test('nested modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 5, ['mod', 5, 3]], {}), 
            1
        );
    });

    test('variadic modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 10, 7, 2], {}), 
            1
        );
    });

    test('invalid modulo', function() {
        expect(function() {
            evalScheem(['mod', 1], {});
        }).to.throw();
    });
});

suite('variables', function() {
    
    test('define valid', function() {
        var env = {name: null, value: null, outer: null};

        assert.deepEqual(
            evalScheem(['define', 'x', 10], env),
            0
        );

        assert.deepEqual(
            {name: 'x', value: 10, outer: {name: null, value: null, outer: null}},
            env
        );
    });

    test('define invalid', function() {
        var env = {name: 'x', value: 10, outer: null};
        expect(function() {
            evalScheem(['define', 'x', 10], env);
        }).to.throw();
    });

    test('set! valid', function() {
        var env = {name: 'x', value: 20, outer: null};
        
        assert.deepEqual(
            evalScheem(['set!', 'x', 10], env),
            0
        );

        assert.deepEqual(
            {name: 'x', value: 10, outer: null},
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
        var env = {name: 'x', value: 10, outer: null};
        
        assert.deepEqual(
            evalScheem('x', env),
            10
        );
    });

    test('read invalid', function() {
        expect(function() {
            evalScheem('x', {});
        }).to.throw();
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
        var env = {name: null, value: null, outer: null};

        assert.deepEqual(
            evalScheem(['begin', ['define', 'x', 10], 'x'], env),
            10
        );
    });

    test('invalid begin', function() {
        var env = {name: null, value: null, outer: null};

        expect(function() {
            evalScheem(['begin'], env);
        }).to.throw();
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

    test('invalid quote', function() {
        expect(function() {
            evalScheem(['quote', 1, 2], {});
        }).to.throw();
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

    var comparators = ['=', '<', '<=', '>=', '>', 'if'];

    for(var i in comparators)
    {
        test('invalid '+comparators[i], function() {
            expect(function() {
                evalScheem([comparators[i], 1, 2, 3, 4], {});
            }).to.throw();
        });
    }
});

suite('lists', function() {

    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons', 3, ['quote', [4, 5]]], {}),
            [3, 4, 5]
        );
    });

    test('invalid cons (args)', function() {
        expect(function() {
            evalScheem(['cons', 3, ['quote', [4, 5]], 4], {});
        }).to.throw();
    });

    test('invalid cons (type)', function() {
        expect(function() {
            evalScheem(['cons', 3, 4], {});
        }).to.throw();
    });

    test('car', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', [4, 5]]], {}),
            4
        );
    });

    test('invalid car (args)', function() {
        expect(function() {
            evalScheem(['car', ['quote', [4, 5]], 6], {});
        }).to.throw();
    });

    test('invalid car (type)', function() {
        expect(function() {
            evalScheem(['car', 6], {});
        }).to.throw();
    });

    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [4, 5]]], {}),
            [5]
        );
    });

    test('invalid cdr (args)', function() {
        expect(function() {
            evalScheem(['cdr', ['quote', [4, 5]], 6], {});
        }).to.throw();
    });

    test('invalid cdr (type)', function() {
        expect(function() {
            evalScheem(['cdr', 6], {});
        }).to.throw();
    });
});

suite('functions', function() {

    test('single argument application', function() {
        var env = {name: 'x', value: function(x) { return x + 1; }, outer: null};

        assert.deepEqual(
            evalScheem(['x', 1], env),
            2
        );
    });

    test('setting a function', function() {
        var env = {name: null, value: null, outer: null};

        assert.deepEqual(
            evalScheem(['x', 1], env),
            2
        );
    });
});

suite('parse', function() {
    test('a number', function() {
        assert.deepEqual(
            SCHEEM.parse('42'),
            42
        );
    });
    test('a variable', function() {
        assert.deepEqual(
            SCHEEM.parse('x'),
            'x'
        );
    });

    test('basic operation', function() {
        assert.deepEqual(
            SCHEEM.parse('(+ 1 2)'),
            ['+', 1, 2]
        );
    });

    test('nested operation', function() {
        assert.deepEqual(
            SCHEEM.parse('(+ (* 3 4) 2)'),
            ['+', ['*', 3, 4], 2]
        );
    });

    test('quoted operation', function() {
        assert.deepEqual(
            SCHEEM.parse('\'2'),
            ['quote', 2]
        );
    });
});

suite('evalScheemString', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheemString('42'),
            42
        );
    });
    test('a variable', function() {
        assert.deepEqual(
            evalScheemString('(begin (define x 10) x)'),
            10
        );
    });

    test('basic operation', function() {
        assert.deepEqual(
            evalScheemString('(+ 1 2)'),
            3
        );
    });

    test('nested operation', function() {
        assert.deepEqual(
            evalScheemString('(+ (* 3 4) 2)'),
            14
        );
    });

    test('quoted operation', function() {
        assert.deepEqual(
            evalScheemString('\'(+ 2 3)'),
            ['+', 2, 3]
        );
    });
});

