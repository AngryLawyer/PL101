var compileEnvironment = function (env) {
    var builtString = '';
    for (var i = 0; i < env.length; ++i) {
        var left = env[i][0];
        var right = env[i][1];
        builtString += 'var ' + left + ' = ' + right.toString() + ';\n';
    }
    return builtString;
};

var compileBinaryOp = function(op, left, right) {
    return '(' + compileExpr(left) + ')' + op + '(' + compileExpr(right) + ')';
};

var repeat = function (num, func) {
    var i;
    var res;
    for(i = 0; i < num; i++) {
        res = func();
    }
    return res;
};

var compileExpr = function (expr) {
    if (typeof expr === 'number') {
        return expr.toString();
    }
    switch(expr.tag) {
        case '+':
            return compileBinaryOp('+', expr.left, expr.right);
        case '-':
            return compileBinaryOp('-', expr.left, expr.right);
        case '*':
            return compileBinaryOp('*', expr.left, expr.right);
        case '/':
            return compileBinaryOp('/', expr.left, expr.right);
        case '=':
            return compileBinaryOp('==', expr.left, expr.right);
        case '!=':
            return compileBinaryOp('!=', expr.left, expr.right);
        case '>':
            return compileBinaryOp('>', expr.left, expr.right);
        case '<':
            return compileBinaryOp('<', expr.left, expr.right);
        case '>=':
            return compileBinaryOp('>=', expr.left, expr.right);
        case '<=':
            return compileBinaryOp('<=', expr.left, expr.right);
        case 'ident':
            return expr.name;
        case 'call':
            var builtString = expr.name + '(';
            
            for (var i = 0; i < expr.args.length; ++i) {
                
                builtString += compileExpr(expr.args[i]);
                
                if ( i != expr.args.length - 1) {
                    builtString += ', ';
                }
            }
            return builtString + ')';
        default:
            throw new Error('Unknown tag ' + expr.tag);
    }
};

var compileStatement = function(stmt) {
    switch(stmt.tag) {
        // A single expression
        case 'repeat':
            var builtString = 'var _res = repeat(';
            builtString += compileExpr(stmt.expr);
            builtString += ', function(){';
            builtString += compileStatements(stmt.body, true);
            return builtString + '});\n';
        case 'if':
            return '_res = undefined;\n' + 
                'if(' + compileExpr(stmt.expr) + ') {\n' +
                compileStatements(stmt.body, false) + '}\n';
        case 'define':
            return '_res = 0;\nvar ' + stmt.name + ' = function(' +
                stmt.args.join(',') + ') {' +
                compileStatements(stmt.body, true) + '};\n';
        case 'var':
            // Evaluates to 0
            return '_res = 0;\nvar ' + stmt.name + ';\n';
        case ':=':
            return '_res = (' + stmt.left + ' = ' + compileExpr(stmt.right) + ');\n';
        case 'ignore':
            return '_res = (' + 
                compileExpr(stmt.body) + ');\n';
        default:
            throw new Error('Unknown tag ' + stmt.tag);
    }
};

var compileStatements = function (stmts, is_funcbody) {
    // Your code here
    var returnString = '';

    for (var i = 0; i < stmts.length; ++i) {
        returnString += compileStatement(stmts[i]);
    }
    
    if (is_funcbody === true) {
        returnString += 'return _res;\n';
    }
    
    return returnString;
};

if (typeof module !== 'undefined') {
    module.exports.compileExpr = compileExpr;
    module.exports.compileStatement = compileStatement;
    module.exports.compileStatements = compileStatements;
    module.exports.compileEnvironment = compileEnvironment;
    module.exports.repeat = repeat;
}
