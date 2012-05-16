var lookup = function (env, v) {

    if ('bindings' in env)
    {
        if (v in env.bindings)
        {
            return env.bindings[v];
        }
        else
        {
            return lookup(env.outer, v);
        }
    }

    throw new Error('Undefined variable '+v);
};

var evalExpr = function(expr, env) {

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }

    // Look at tag to see what to do
    switch(expr.tag) {
        case '+':
            return evalExpr(expr.left, env) +
                   evalExpr(expr.right, env);
        case '-':
            return evalExpr(expr.left, env) -
                   evalExpr(expr.right, env);
        case '*':
            return evalExpr(expr.left, env) *
                   evalExpr(expr.right, env);
        case '/':
            return evalExpr(expr.left, env) /
                   evalExpr(expr.right, env);

        case '=':
            return evalExpr(expr.left, env) ==
                   evalExpr(expr.right, env);
        case '!=':
            return evalExpr(expr.left, env) !=
                   evalExpr(expr.right, env);
        case '>':
            return evalExpr(expr.left, env) >
                   evalExpr(expr.right, env);
        case '<':
            return evalExpr(expr.left, env) <
                   evalExpr(expr.right, env);
        case '>=':
            return evalExpr(expr.left, env) >=
                   evalExpr(expr.right, env);
        case '<=':
            return evalExpr(expr.left, env) <=
                   evalExpr(expr.right, env);

        case 'ident':
            return lookup(env, expr.name);
    }
}

var evalStatement = function (stmt, env) {

}

var evalStatements = function (stmts, env) {
}

if (typeof module !== 'undefined') {
    module.exports.evalExpr = evalExpr;
    module.exports.evalStatement = evalStatement;
    module.exports.evalStatements = evalStatements;
}
