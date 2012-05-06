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

var add_binding = function (env, v, val) {

    env.outer = {
        name: env.name,
        value: env.value,
        outer: env.outer
    };
    
    env.name = v;
    env.value = val;
};

var update = function (env, v, val) {
    if (env.name === v)
    {
        env.value = val;
    }
    else
    {
        if (env.outer !== null)
        {
            update(env.outer, v, val);
        }
        else
        {
            throw new Error('Undefined variable '+v);
        }
    }
};

var lookup = function (env, v) {
    while(env !== null && env.name !== v)
    {
        env = env.outer;
    }
    if (env)
    {
        return env.value;
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
            //Check that we're not destroying an extant variable
            if (env !== null)
            {
                if (env.name === expr[1])
                {
                    throw new Error("Attempting to redefine variable "+expr[1]);
                }
            }
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
            if (evalScheem(expr[1]) === '#t')
            {
                return evalScheem(expr[2]);
            }
            return evalScheem(expr[3]);
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
        case 'lambda-one':
            return function(param) {
                return evalScheem(expr[2], {
                    name: expr[1],
                    value: param,
                    outer: env
                });
            };
        default:
            // Simple application
            var func = evalScheem(expr[0], env);
            var arg = evalScheem(expr[1], env);
            return func(arg);
    }
};

var evalScheemString = function(Scheem) {
    return evalScheem(SCHEEM.parse(Scheem), {
        name: null,
        value: null,
        outer: null
    });
};

module.exports.evalScheem = evalScheem;
module.exports.evalScheemString = evalScheemString;
