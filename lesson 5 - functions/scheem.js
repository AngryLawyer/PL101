if (typeof module !== 'undefined') {
    var SCHEEM = require('./parser').SCHEEM;
}

var ensureArgumentCount = function(expr, count, is_minimum) {

    var length = expr.length;

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

var defaultEnvironment = {
    bindings: {
        '+': function() {
            ensureArgumentCount(arguments, 2, true);
            var result = 0;
            for (var i in arguments)
            {
                result += arguments[i];
            }
            return result;
        },
        '-': function() {
            ensureArgumentCount(arguments, 2, true);
            var result = arguments[0];
            for(var i = 1; i < arguments.length; ++i)
            {
                result -= arguments[i];
            }
            return result;
        },
        '*': function() {
            ensureArgumentCount(arguments, 2, true);
            var result = arguments[0];
            for(var i = 1; i < arguments.length; ++i)
            {
                result *= arguments[i];
            }
            return result;
        },
        '/': function() {
            ensureArgumentCount(arguments, 2, true);
            var result = arguments[0];
            for(var i = 1; i < arguments.length; ++i)
            {
                result /= arguments[i];
            }
            return result;
        },
        'mod': function() {
            ensureArgumentCount(arguments, 2, true);
            var result = arguments[0];
            for(var i = 1; i < arguments.length; ++i)
            {
                result = result % arguments[i];
            }
            return result;
        },
        '=': function(x, y) {
            ensureArgumentCount(arguments, 2);
            return x===y?'#t':'#f';
        },
        '<': function(x, y) {
            ensureArgumentCount(arguments, 2);
            return x<y?'#t':'#f';
        },
        '>': function(x, y) {
            ensureArgumentCount(arguments, 2);
            return x>y?'#t':'#f';
        },
        '<=': function(x, y) {
            ensureArgumentCount(arguments, 2);
            return x<=y?'#t':'#f';
        },
        '>=': function(x, y) {
            ensureArgumentCount(arguments, 2);
            return x>=y?'#t':'#f';
        },
        'cons': function(x, y) {
            ensureArgumentCount(arguments, 2);
            y.unshift(x); //TODO: Find non-destructive update
            return y;
        },
        'car': function(x) {
            ensureArgumentCount(arguments, 1);
            if (typeof x !== 'object' || Array.isArray(x) !== true)
                throw new Error('Type error');

            return x[0];
        },
        'cdr': function(x) {
            ensureArgumentCount(arguments, 1);
            if (typeof x !== 'object' || Array.isArray(x) !== true)
                throw new Error('Type error');
            return x.slice(1);
        }
    },
    outer: {}
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
        case 'define':
            ensureArgumentCount(expr, 2 + 1);
            add_binding(env, expr[1], evalScheem(expr[2], env));
            return 0;
        case 'set!':
            ensureArgumentCount(expr, 2 + 1);
            update(env, expr[1], evalScheem(expr[2], env));
            return 0;
        case 'begin':
            ensureArgumentCount(expr, 1 + 1, true);
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
            ensureArgumentCount(expr, 1 + 1);
            return expr[1];
        case 'if':
            ensureArgumentCount(expr, 3 + 1);
            if (evalScheem(expr[1], env) === '#t')
            {
                return evalScheem(expr[2], env);
            }
            return evalScheem(expr[3], env);
        case 'let-one':
            ensureArgumentCount(expr, 3 + 1);
            var bindings = {};
            bindings[expr[1]] = evalScheem(expr[2], env);
            
            return evalScheem(expr[3], {
                bindings: bindings,
                outer: env
            });
        case 'lambda-one':
            ensureArgumentCount(expr, 2 + 1);
            return function(param) {
                var bindings = {};
                bindings[expr[1]] = param;
                return evalScheem(expr[2], {
                    bindings: bindings,
                    outer: env
                });
            };
        case 'lambda':
            ensureArgumentCount(expr, 1 + 1, true);
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
    return evalScheem(SCHEEM.parse(Scheem), {'bindings': {}, 'outer': defaultEnvironment});
};

module.exports.evalScheem = evalScheem;
module.exports.evalScheemString = evalScheemString;
module.exports.defaultEnvironment = defaultEnvironment;
