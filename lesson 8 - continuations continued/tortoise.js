var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return { tag: "thunk", func: f, args: args };
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var stepStart = function (expr, env, startFunc) {
    return { 
        data: startFunc(expr, env, thunkValue),
        done: false
    };
};

var step = function (state) {
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
    var state = stepStart(expr, env, evalExpr);
    while(!state.done) {
        step(state);
    }
    return state.data;
};

var evalFullStatement = function (expr, env) {
    var state = stepStart(expr, env, evalStatement);
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
            var args = expr.args.map(function(item) { return evalExpr(item, env, thunkValue) });
            return thunk(func, args, env, cont);
        case 'ident':
            return thunk(cont, lookup(env, expr.name));
    }
}

var evalStatement = function (stmt, env, cont) {
    // Statements always have tags
    switch(stmt.tag) {
        // A single expression
        case 'ignore':
            // Just evaluate expression
            return thunk(evalExpr, stmt.body, env, cont);
        // Repeat
        case 'repeat':
            return thunk(evalExpr, stmt.expr, env, function(count) {
                if (count === 0) {
                    return thunk(cont, 0);
                }
                var next = function(idx) {
                    return function(v) {
                        var nextId = idx+1;
                        if(nextId === count) {
                            return thunk(cont,v);
                        }
                        return thunk(evalStatements,stmt.body,env,next(nextId));
                    };
                };

                return thunk(evalStatements,stmt.body,env,next(0));
            });

        // Declare new variable
        case 'var':
            // New variable gets default value of 0
            add_binding(env, stmt.name, 0);
            return thunk(cont, 0);
        case ':=':
            // Evaluate right hand side
            return thunk(evalExpr, stmt.right, env, function(val) {
                update(env, stmt.left, val);
                return thunk(cont, val);
            });
        case 'if':
            return thunk(evalExpr, stmt.expr, env, function(result) {
                if (result) {
                    return thunk(evalStatements, stmt.body, env, cont);
                }
                return thunk(cont, undefined);
            });
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

var evalStatements = function (stmts, env, cont) {
    var next = function(idx) {
        return function(v) {
            var nextId = idx+1;
            if(nextId === stmts.length) {
                return thunk(cont,v);
            }
            return thunk(evalStatement,stmts[nextId],env,next(nextId));
        };
    };
    return thunk(evalStatement,stmts[0],env,next(0));
};

if (typeof module !== 'undefined') {
    module.exports.evalFullStatement = evalFullStatement;
    module.exports.evalFull = evalFull;
    module.exports.evalExpr = evalExpr;
    module.exports.evalStatement = evalStatement;
    module.exports.evalStatements = evalStatements;
    module.exports.lookup = lookup;
}
