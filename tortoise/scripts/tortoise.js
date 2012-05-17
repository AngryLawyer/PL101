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

var update = function (env, left, v) {

    if ('bindings' in env)
    {
        if (left in env.bindings)
        {
            env.bindings[left] = v;
            return 0;
        }
        else
        {
            return update(env.outer, left, v);
        }
    }
    
    throw new Error('Undefined variable '+left);
};

var add_binding = function (env, stmt, value) {

    //Redefine a variable if it already exists
    var up = env;
    while('bindings' in up)
    {
        if (stmt in up.bindings)
        {
            env[stmt] = value;
            return 0;
        }
        up = up.outer;
    }

    if ('bindings' in env === false)
    {
        env.bindings = {};
        env.outer = {};
    }

    env.bindings[stmt] = value;
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
        case 'call':
            return lookup(env, expr.name).apply(null, expr.args.map(function(item) {return evalExpr(item, env)}));
        case 'ident':
            return lookup(env, expr.name);
    }
}

var evalStatement = function (stmt, env) {
    var val = undefined;
    // Statements always have tags
    switch(stmt.tag) {
        // A single expression
        case 'ignore':
            // Just evaluate expression
            return evalExpr(stmt.body, env);
        // Repeat
        case 'repeat':
            var count = evalExpr(stmt.expr, env);
            var lastValue = 0;
            
            for (var i = 0; i < count; ++i)
            {
                lastValue = evalStatements(stmt.body, env);
            }

            return lastValue;
        // Declare new variable
        case 'var':
            // New variable gets default value of 0
            add_binding(env, stmt.name, 0);
            return 0;
        case ':=':
            // Evaluate right hand side
            val = evalExpr(stmt.right, env);
            update(env, stmt.left, val);
            return val;
        case 'if':
            if(evalExpr(stmt.expr, env)) {
                val = evalStatements(stmt.body, env);
            }
            return val;
        case 'define':
            // name args body
            var new_func = function() {
                // This function takes any number of arguments
                var i;
                var new_env;
                var new_bindings;
                new_bindings = { };
                for(i = 0; i < stmt.args.length; i++) {
                    new_bindings[stmt.args[i]] = arguments[i];
                }
                new_env = { bindings: new_bindings, outer: env };
                return evalStatements(stmt.body, new_env);
            };
            add_binding(env, stmt.name, new_func);
            return 0;
    }
};

var evalStatements = function (stmts, env) {
    var i;
    var val = undefined;
    for(i = 0; i < stmts.length; i++) {
        val = evalStatement(stmts[i], env);
    }
    return val;
}

if (typeof module !== 'undefined') {
    module.exports.evalExpr = evalExpr;
    module.exports.evalStatement = evalStatement;
    module.exports.evalStatements = evalStatements;
    module.exports.lookup = lookup;
}
