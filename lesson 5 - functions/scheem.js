if (typeof module !== 'undefined') {
    var SCHEEM = require('./parser').SCHEEM;
}

var ensureArgumentCount = function(expr, count, is_minimum) {

    var length = expr.length - 1; //One less due to the root argument

    if (is_minimum)
    {
        if (length < count)
            throw new Error("Argument count mismatch - got " + length + " expected >= "+count);
    }
    else
    {
        if (length != count)
            throw new Error("Argument count mismatch - got " + length + " expected "+count);
    }
}

var lookup = function (env, v) {

    if (env === undefined)
    {
        console.log(v);
    }

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

var add_binding = function (env, v, val) {

    //Check we're not already defined
    var up = env;
    while('bindings' in up)
    {
        if (v in up.bindings)
        {
            throw new Error("Attempting to redefine variable "+v);
        }
        up = up.outer;
    }

    if ('bindings' in env === false)
    {
        env.bindings = {};
        env.outer = {};
    }

    env.bindings[v] = val;   
};

var update = function (env, v, val) {

    if ('bindings' in env)
    {
        if (v in env.bindings)
        {
            env.bindings[v] = val;
            return 0;
        }
        else
        {
            update(env.outer, v, val);
        }
    }
    
    throw new Error('Undefined variable '+v);
};

var evalScheem = function (expr, env) {

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return lookup(env, expr);
    }

    switch (expr[0]) {
        case '=':
            ensureArgumentCount(expr, 2);
            var eq =
                (evalScheem(expr[1], env) ===
                 evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case '+':
            ensureArgumentCount(expr, 2, true);
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result += evalScheem(expr[i], env);
            }
            return result;
        case '-':
            ensureArgumentCount(expr, 2, true);
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result -= evalScheem(expr[i], env);
            }
            return result;
        case '*':
            ensureArgumentCount(expr, 2, true);
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result *= evalScheem(expr[i], env);
            }
            return result;
        case '/':
            ensureArgumentCount(expr, 2, true);
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result /= evalScheem(expr[i], env);
            }
            return result;
        case 'mod':
            ensureArgumentCount(expr, 2, true);
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result = result % evalScheem(expr[i], env);
            }
            return result;
        case 'define':
            ensureArgumentCount(expr, 2);
            add_binding(env, expr[1], evalScheem(expr[2], env));
            return 0;
        case 'set!':
            ensureArgumentCount(expr, 2);
            update(env, expr[1], evalScheem(expr[2], env));
            return 0;
        case 'begin':
            ensureArgumentCount(expr, 1, true);
            var last;
            
            for (var index in expr)
            {
                if (index > 0)
                {
                    last = evalScheem(expr[index], env);
                }
            }
            return last;
        case 'quote':
            ensureArgumentCount(expr, 1);
            return expr[1];
        case '<':
            ensureArgumentCount(expr, 2);
            var lt =
                (evalScheem(expr[1], env) <
                 evalScheem(expr[2], env));
            if (lt) return '#t';
            return '#f';
        case '>':
            ensureArgumentCount(expr, 2);
            var gt =
                (evalScheem(expr[1], env) >
                 evalScheem(expr[2], env));
            if (gt) return '#t';
            return '#f';
        case '<=':
            ensureArgumentCount(expr, 2);
            var lt =
                (evalScheem(expr[1], env) <=
                 evalScheem(expr[2], env));
            if (lt) return '#t';
            return '#f';
        case '>=':
            ensureArgumentCount(expr, 2);
            var gt =
                (evalScheem(expr[1], env) >=
                 evalScheem(expr[2], env));
            if (gt) return '#t';
            return '#f';
        case 'if':
            ensureArgumentCount(expr, 3);
            if (evalScheem(expr[1], env) === '#t')
            {
                return evalScheem(expr[2], env);
            }
            return evalScheem(expr[3], env);
        case 'cons':
            ensureArgumentCount(expr, 2);
            var secondHalf = evalScheem(expr[2], env);
            secondHalf.unshift(evalScheem(expr[1], env)); //TODO: Find non-destructive update
            return secondHalf;
        case 'car':
            ensureArgumentCount(expr, 1);
            var firstArg = evalScheem(expr[1], env);
            if (typeof firstArg !== 'object' || Array.isArray(firstArg) !== true)
                throw new Error('Type error');
            return firstArg[0];
        case 'cdr':
            ensureArgumentCount(expr, 1);
            var firstArg = evalScheem(expr[1], env);
            if (typeof firstArg !== 'object' || Array.isArray(firstArg) !== true)
                throw new Error('Type error');
            return firstArg.slice(1);
        case 'let-one':
            var bindings = {};
            bindings[expr[1]] = evalScheem(expr[2], env);
            
            return evalScheem(expr[3], {
                bindings: bindings,
                outer: env
            });
        case 'lambda-one':
            return function(param) {
                var bindings = {};
                bindings[expr[1]] = param;
                return evalScheem(expr[2], {
                    bindings: bindings,
                    outer: env
                });
            };
        case 'lambda':
            return function() {
                //Take our middle
                var bindings = {};
                for (var i in expr[1])
                {
                    bindings[expr[1][i]] = arguments[i];
                }

                return evalScheem(expr[expr.length - 1], {
                    bindings: bindings,
                    outer: env
                });
            };
        default:
            var args = expr.slice(1);
            //Flatten
            for (var arg in args)
            {
                args[arg] = evalScheem(args[arg], env);
            }
            return evalScheem(expr[0], env).apply(null, args);
    }
};

var evalScheemString = function(Scheem) {
    return evalScheem(SCHEEM.parse(Scheem), {});
};

module.exports.evalScheem = evalScheem;
module.exports.evalScheemString = evalScheemString;
