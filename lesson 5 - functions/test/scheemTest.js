if (typeof module !== 'undefined') {
    // In Node load required modules
    var assert = require('chai').assert;
    var evalScheem = require('../scheem').evalScheem;
    var evalScheemString = require('../scheem').evalScheemString;
    var SCHEEM = require('../parser').SCHEEM;
    var DE = require('../scheem').defaultEnvironment;
    var expect = require('chai').expect;

} else {
    // In browser assume already loaded by <script> tags
    var assert = chai.assert;
    var expect = chai.expect;
}

suite('numbers', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(3, DE),
            3
        );
    });
    test('zero', function() {
        assert.deepEqual(
            evalScheem(0, DE),
            0
        );
    });

    test('a negative number', function() {
        assert.deepEqual(
            evalScheem(-1, DE),
            -1
        );
    });
});

suite('basic operations', function() {
    test('addition', function() {
        assert.deepEqual(
            evalScheem(['+', 1, 2], DE), 
            3
        );
    });

    test('nested addition', function() {
        assert.deepEqual(
            evalScheem(['+', 1, ['+', 3, 4]], DE), 
            8
        );
    });

    test('variadic addition', function() {
        assert.deepEqual(
            evalScheem(['+', 1, 2, 3], DE), 
            6
        );
    });

    test('invalid addition', function() {
        expect(function() {
            evalScheem(['+', 1], DE);
        }).to.throw();
    });

    test('subtraction', function() {
        assert.deepEqual(
            evalScheem(['-', 2, 1], DE), 
            1
        );
    });

    test('nested subtraction', function() {
        assert.deepEqual(
            evalScheem(['-', 10, ['-', 2, 1]], DE), 
            9
        );
    });

    test('variadic subtraction', function() {
        assert.deepEqual(
            evalScheem(['-', 5, 2, 3], DE), 
            0
        );
    });

    test('invalid addition', function() {
        expect(function() {
            evalScheem(['-', 1], DE);
        }).to.throw();
    });

    test('multiplication', function() {
        assert.deepEqual(
            evalScheem(['*', 3, 2], DE), 
            6
        );
    });

    test('nested multiplication', function() {
        assert.deepEqual(
            evalScheem(['*', 2, ['*', 3, 4]], DE), 
            24
        );
    });

    test('variadic multiplication', function() {
        assert.deepEqual(
            evalScheem(['*', 2, 2, 3], DE), 
            12
        );
    });

    test('invalid multiplication', function() {
        expect(function() {
            evalScheem(['*', 1], DE);
        }).to.throw();
    });

    test('division', function() {
        assert.deepEqual(
            evalScheem(['/', 6, 2], DE), 
            3
        );
    });

    test('nested division', function() {
        assert.deepEqual(
            evalScheem(['/', 10, ['/', 4, 2]], DE), 
            5
        );
    });

    test('variadic division', function() {
        assert.deepEqual(
            evalScheem(['/', 20, 2, 2], DE), 
            5
        );
    });

    test('invalid division', function() {
        expect(function() {
            evalScheem(['/', 1], DE);
        }).to.throw();
    });

    test('modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 5, 2], DE), 
            1
        );
    });

    test('nested modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 5, ['mod', 5, 3]], DE), 
            1
        );
    });

    test('variadic modulo', function() {
        assert.deepEqual(
            evalScheem(['mod', 10, 7, 2], DE), 
            1
        );
    });

    test('invalid modulo', function() {
        expect(function() {
            evalScheem(['mod', 1], DE);
        }).to.throw();
    });
});

suite('variables', function() {
    
    test('define valid', function() {
        var env = {'bindings': {}, 'outer': DE};

        assert.deepEqual(
            evalScheem(['define', 'x', 10], env),
            0
        );

        assert.deepEqual(
            { bindings: {'x': 10}, outer: DE},
            env
        );
    });

    test('define invalid', function() {
        var env = { bindings: {'x': 10}, outer: DE};
        expect(function() {
            evalScheem(['define', 'x', 10], env);
        }).to.throw();
    });

    test('define deep invalid', function() {
        var env = { bindings: {'y': 10}, outer: { bindings: {'x': 10}, outer: DE}};
        expect(function() {
            evalScheem(['define', 'x', 10], env);
        }).to.throw();
    });

    test('set! valid', function() {
        var env = { bindings: {'x': 20}, outer: DE};
        
        assert.deepEqual(
            evalScheem(['set!', 'x', 10], env),
            0
        );

        assert.deepEqual(
            { bindings: {'x': 10}, outer: DE},
            env
        );
    });

    test('set! invalid', function() {
        var env = {'bindings': {}, 'outer': DE};
        expect(function() {
            evalScheem(['set!', 'x', 10], env);
        }).to.throw();
    });

    //Read
    test('read', function() {
        var env = { bindings: {'x': 10}, outer: DE};
        
        assert.deepEqual(
            evalScheem('x', env),
            10
        );
    });

    test('read invalid', function() {
        expect(function() {
            evalScheem('x', DE);
        }).to.throw();
    });
});

suite('begin', function() {

    test('single begin', function() {
        assert.deepEqual(
            evalScheem(['begin', 4], DE),
            4
        );
    });

    test('multi begin', function() {
        assert.deepEqual(
            evalScheem(['begin', 4, 5, 6], DE),
            6
        );
    });

    test('preserve', function() {
        var env = {'bindings': {}, 'outer': DE};

        assert.deepEqual(
            evalScheem(['begin', ['define', 'x', 10], 'x'], env),
            10
        );
    });

    test('preserve part 2', function() {
        var env = {'bindings': {}, 'outer': DE};

        assert.deepEqual(
            evalScheem(['begin', ['define', 'x', 10], ['+', 'x', 5]], env),
            15
        );
    });

    test('invalid begin', function() {
        var env = DE;

        expect(function() {
            evalScheem(['begin'], env);
        }).to.throw();
    });
});

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], DE),
            3
        );
    });

    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], DE),
            'dog'
        );
    });

    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], DE),
            [1, 2, 3]
        );
    });

    test('nested list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, ['quote', 3, 4]]], DE),
            [1, 2, ['quote', 3, 4]]
        );
    });

    test('invalid quote', function() {
        expect(function() {
            evalScheem(['quote', 1, 2], DE);
        }).to.throw();
    });
});

suite('comparators', function() {

    test('= true', function() {
        assert.deepEqual(
            evalScheem(['=', 3, 3], DE),
            '#t'
        );
    });

    test('= false', function() {
        assert.deepEqual(
            evalScheem(['=', 3, 4], DE),
            '#f'
        );
    });

    test('< true', function() {
        assert.deepEqual(
            evalScheem(['<', 3, 4], DE),
            '#t'
        );
    });

    test('< false', function() {
        assert.deepEqual(
            evalScheem(['<', 3, 3], DE),
            '#f'
        );
    });

    test('> true', function() {
        assert.deepEqual(
            evalScheem(['>', 4, 3], DE),
            '#t'
        );
    });

    test('> false', function() {
        assert.deepEqual(
            evalScheem(['>', 3, 3], DE),
            '#f'
        );
    });

    test('<= true', function() {
        assert.deepEqual(
            evalScheem(['<=', 3, 3], DE),
            '#t'
        );
    });

    test('<= false', function() {
        assert.deepEqual(
            evalScheem(['<=', 3, 2], DE),
            '#f'
        );
    });

    test('>= true', function() {
        assert.deepEqual(
            evalScheem(['>=', 3, 3], DE),
            '#t'
        );
    });

    test('>= false', function() {
        assert.deepEqual(
            evalScheem(['>=', 2, 3], DE),
            '#f'
        );
    });

    test('if true', function() {
        assert.deepEqual(
            evalScheem(['if', ['>', 3, 2], ['quote', 'first'], ['quote', 'second']], DE),
            'first'
        );
    });

    test('if false', function() {
        assert.deepEqual(
            evalScheem(['if', ['>', 2, 3], ['quote', 'first'], ['quote', 'second']], DE),
            'second'
        );
    });

    test('if with variables', function() {
        var env = {'bindings': {}, 'outer': DE};
        assert.deepEqual(
            evalScheem(
                ['begin', 
                    ['define',
                        'x', 
                        10
                    ],
                    ['if', 
                        ['=', 
                            'x', 
                            2
                        ],
                        ['quote', 'same'],
                        ['quote', 'different']
                    ]
                ], env),
            'different'
        );
    });

    var comparators = ['=', '<', '<=', '>=', '>', 'if'];

    for(var i in comparators)
    {
        test('invalid '+comparators[i], function() {
            expect(function() {
                evalScheem([comparators[i], 1, 2, 3, 4], DE);
            }).to.throw();
        });
    }
});

suite('lists', function() {

    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons', 3, ['quote', [4, 5]]], DE),
            [3, 4, 5]
        );
    });

    test('invalid cons (args)', function() {
        expect(function() {
            evalScheem(['cons', 3, ['quote', [4, 5]], 4], DE);
        }).to.throw();
    });

    test('invalid cons (type)', function() {
        expect(function() {
            evalScheem(['cons', 3, 4], DE);
        }).to.throw();
    });

    test('car', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', [4, 5]]], DE),
            4
        );
    });

    test('invalid car (args)', function() {
        expect(function() {
            evalScheem(['car', ['quote', [4, 5]], 6], DE);
        }).to.throw();
    });

    test('invalid car (type)', function() {
        expect(function() {
            evalScheem(['car', 6], DE);
        }).to.throw();
    });

    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', [4, 5]]], DE),
            [5]
        );
    });

    test('invalid cdr (args)', function() {
        expect(function() {
            evalScheem(['cdr', ['quote', [4, 5]], 6], DE);
        }).to.throw();
    });

    test('invalid cdr (type)', function() {
        expect(function() {
            evalScheem(['cdr', 6], DE);
        }).to.throw();
    });
});

suite('let', function() {
    test('let-one', function() {
        assert.deepEqual(
            evalScheem(['let-one', 'x', ['+', 2, 2], 'x'], DE),
            4
        );
    });

    test('let-one nested', function() {
        assert.deepEqual(
            evalScheem(['let-one', 'x', 2, ['let-one', 'y', 2, ['+', 'x', 'y']]], DE),
            4
        );
    });

    test('let-one hiding', function() {
        assert.deepEqual(
            evalScheem(['let-one', 'x', 2, ['let-one', 'x', 6, 'x']], DE),
            6
        );
    });
});

suite('functions', function() {

    test('single argument application', function() {
        var env = { bindings: {'x': function(x){ return x + 1; }}, outer: DE};

        assert.deepEqual(
            evalScheem(['x', 1], env),
            2
        );
    });

    test('multiple argument application', function() {
        var env = { bindings: {'x': function(x, y, z){ return x + y + z; }}, outer: DE};

        assert.deepEqual(
            evalScheem(['x', 1, 2, 3], env),
            6
        );
    });

    test('lambda-one', function() {
        assert.deepEqual(
            evalScheem([['lambda-one', ['x'], ['+', 'x', 1]], 1], DE), 
            2
        );
    });

    test('lambda-one nested', function() {
        assert.deepEqual(
            evalScheem([[['lambda-one', ['x'], ['lambda-one', 'y', ['+', 'x', 'y']]], 10], 5], DE), 
            15
        );
    });

    
    test('lambda', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x'], ['+', 'x', 1]], 1], DE), 
            2
        );
    });

    test('lambda 2 args', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x', 'y'], ['+', 'x', 'y']], 2, 3], DE), 
            5
        );
    });

    test('lambda in define', function() {
        var env = {'bindings': {}, 'outer': DE};
        assert.deepEqual(
            evalScheem(['begin', ['define', 'magic', ['lambda', ['x', 'y'], ['+', 'x', 'y']]], ['magic', 2, 3]], env), 
            5
        );
    });

    test('complex lambda in define', function() {
        var env = {'bindings': {}, 'outer': DE};
        assert.deepEqual(
            evalScheem(
                ['begin', 
                    ['define', 
                        'magic',
                        ['lambda-one', 
                            ['x'],
                            ['if', 
                                ['=', 
                                    'x',
                                    10
                                ],
                                ['quote', 'it\'s 10'],
                                ['quote', 'it\'s not 10']
                            ]
                        ]
                    ], 
                    ['magic', 2]
                ], env), 
            'it\'s not 10'
        );
    });

    test('lambda takes function', function() {
        var env = {'bindings': {}, 'outer': DE};
        assert.deepEqual(
            evalScheem(
                ['begin', 
                    ['define', 'magic', 
                        ['lambda', 
                            ['x', 'y'], 
                            ['x', 'y']
                        ]
                    ], 
                    ['magic', 
                        ['lambda', 
                            ['x'],
                            ['*', 'x', 2], 
                        ],
                        3
                    ]
                ], 
            env), 
            6
        );
    });

    test('lambda returns function', function() {
        var env = {'bindings': {}, 'outer': DE};
        assert.deepEqual(
            evalScheem(
                ['begin', 
                    ['define', 'magic', 
                        ['lambda', 
                            ['x'], 
                            ['lambda',
                                ['y'],
                                ['*', 'x', 'y'] 
                            ]
                        ]
                    ], 
                    [
                        ['magic', 5],
                        2
                    ]
                ], 
            env), 
            10
        );
    });
});

suite('alert', function() {
    
    test('alert', function() {
        assert.deepEqual(
            evalScheem(['alert', ['quote', 'testing']], DE), 
            0
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

    test('factorial', function() {
        assert.deepEqual(
            evalScheemString(
                '(begin'+
                '  (define factorial'+
                '    (lambda (n)'+
                '      (if (= n 0) 1'+
                '          (* n (factorial (- n 1))))))'+
                '(factorial 5))'),
            120
        );
    });
    
});

