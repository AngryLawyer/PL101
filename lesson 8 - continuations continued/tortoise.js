var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return { tag: "thunk", func: f, args: args };
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var stepStart = function (expr, env) {
    return { 
        data: evalExpr(expr, env, thunkValue),
        done: false
    };
};

var step = function (state) {
    // Your code here
    if (state.data.tag === "value") {
        state.data = state.data.val;
        state.done = true;
    } else if (state.data.tag === "thunk") {
        state.data = state.data.func.apply(null, state.data.args);
    } else {
        throw new Error("Bad thunk");
    }
};

var evalFull = function (expr, env) {
    var state = stepStart(expr, env);
    while(!state.done) {
        step(state);
    }
    return state.data;
};

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

var twoItemOp = function(left, right, env, cont, op) {
    return thunk(
        evalExpr, left, env,
        function(v1) {
            return thunk(
                evalExpr, right, env,
                function(v2) {
                    return thunk(cont, op(v1, v2));
                }
            );
        }
    );
};

var oneItemOp = function(item, env, cont, op) {
    return thunk(
        evalExpr, item, env, 
        function(v1) {
            return thunk(cont, op(v1));
        }
    );
};

var evalExpr = function(expr, env, cont) {

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return thunk(cont, expr);
    }

    // Look at tag to see what to do
    switch(expr.tag) {
        case '+':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a + b; });
        case '-':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a - b; });
        case '*':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a * b; });
        case '/':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a / b; });
        case '=':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a == b; });
        case '!=':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a != b; });
        case '>':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a > b; });
        case '<':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a < b; });
        case '>=':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a >= b; });
        case '<=':
            return twoItemOp(expr.left, expr.right, env, cont, function(a, b) { return a <= b; });
        case 'call':
            var func = lookup(env, expr.name);
            if (func instanceof function)
            {
            }
            else
            {
                return func.apply(null, expr.args.map(function(item) { return evalExpr(item, env) }));
            }
        case 'ident':
            return thunk(cont, lookup(env, expr.name));
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
    module.exports.evalFull = evalFull;
    module.exports.evalExpr = evalExpr;
    module.exports.evalStatement = evalStatement;
    module.exports.evalStatements = evalStatements;
    module.exports.lookup = lookup;
}
