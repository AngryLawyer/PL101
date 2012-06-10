if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var compileExpr = require('../tortoise').compileExpr;
    var compileStatement = require('../tortoise').compileStatement;
    var compileStatements = require('../tortoise').compileStatements;
    var compileEnvironment = require('../tortoise').compileEnvironment;
    var repeat = require('../tortoise').repeat;
    var parse = PEG.buildParser(fs.readFileSync(
        'tortoise.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = TORTOISE.parse;
    var assert = chai.assert;
}

var evalCompiled = function (prg, env) {
    if(env) {
        return eval(compileEnvironment(env) + prg);
    }
    return eval(prg);
};

suite('compileExpression', function () {
    var env = [['x', 5], ['y', 24], ['f', function(a) { return 3 * a + 1; }], ['z', 101]];

    test('number', function () {
        var expr = parse('5', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 5);
    });
    test('2<3', function () {
        var expr = parse('2 < 3', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), true);
    });
    test('2>3', function () {
        var expr = parse('2 > 3', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), false);
    });
    test('2+2', function () {
        var expr = parse('2 + 2', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 4);
    });
    test('2+3*4', function () {
        var expr = parse('2 + 3 * 4', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 14);
    });
    test('(2+3)*4', function () {
        var expr = parse('(2 + 3) * 4', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 20);
    });
    test('ident x', function () {
        var expr = parse('x', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 5);
    });
    test('ident z', function () {
        var expr = parse('z', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 101);
    });
    test('x+y', function () {
        var expr = parse('x + y', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 29);
    });
    test('f(3)', function () {
        var expr = parse('f(3)', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 10);
    });
    test('f(f(3)+1)*2', function () {
        var expr = parse('f(f(3)+1)*2', 'expression');
        assert.deepEqual(evalCompiled(compileExpr(expr), env), 68);
    });
});

suite('compileStatement', function () {
    var env = [['_res', 0], ['x', 5], ['y', 24], ['f', function(a) { return 3 * a + 1; }], ['z', 101]];

    test('x;', function () {
        var stmt = parse('x;', 'statement');
        assert.deepEqual(evalCompiled(compileStatement(stmt), env), 5);
    });
    test('x := 3;', function () {
        var stmt = parse('x := 3;', 'statement');
        assert.deepEqual(evalCompiled(compileStatement(stmt), env), 3);
    });
    test('x := f(3) + 1;', function () {
        var stmt = parse('x := f(3) + 1;', 'statement');
        assert.deepEqual(evalCompiled(compileStatement(stmt), env), 11);
    });
    test('declare var', function () {
        var stmt = parse('var a;', 'statement');
        assert.deepEqual(evalCompiled(compileStatement(stmt), env), 0);
    });
    test('simple if taken', function () {
        var stmt = parse('if(1 < 2) { 55; }', 'statement');
        assert.deepEqual(evalCompiled(compileStatement(stmt), env), 55);
    });
    test('simple if not taken', function () {
        var stmt = parse('if(2 < 1) { x := 77; }', 'statement');
        assert.deepEqual(evalCompiled(compileStatement(stmt), env), undefined);
    });
});

suite('compileStatements', function () {
    var env = [['_res', 0], ['x', 5], ['y', 24], ['f', function(a) { return 3 * a + 1; }], ['z', 101]];

    test('repeat increment', function () {
        var stmt = parse('repeat(4) { x := x + 1; } x;', 'statements');
        assert.deepEqual(evalCompiled(compileStatements(stmt, false), env), 9);
    });
    test('repeat two statements', function () {
        var stmt = parse('repeat(4) { x := x + 1; y:=x;} y;', 'statements');
        assert.deepEqual(evalCompiled(compileStatements(stmt, false), env), 9);
    });

    test('simple define', function () {
        var stmt = parse('define g(a) { x := a; } g(-3); x;', 'statements');
        assert.deepEqual(evalCompiled(compileStatements(stmt, false), env), -3);
    });

    test('3; f(3);', function () {
        var stmt = parse('3; f(3);', 'statements');
        assert.deepEqual(evalCompiled(compileStatements(stmt, false), env), 10);
    });
    test('simple define sequenced', function () {
        var stmt = parse('define g() {} 100;', 'statements');
        assert.deepEqual(evalCompiled(compileStatements(stmt, false), env), 100);
    });
});
