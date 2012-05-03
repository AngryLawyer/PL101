var ensureArgumentCount = function(expr, count, is_minimum) {
    if (is_minimum)
    {
    }
    else
    {
    }
}

var evalScheem = function (expr, env) {

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    if (expr === 'error') throw('Error');

    switch (expr[0]) {
        case '=':
            var eq =
                (evalScheem(expr[1], env) ===
                 evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case '+':
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result += evalScheem(expr[i], env);
            }
            return result;
        case '-':
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result -= evalScheem(expr[i], env);
            }
            return result;
        case '*':
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result *= evalScheem(expr[i], env);
            }
            return result;
        case '/':
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result /= evalScheem(expr[i], env);
            }
            return result;
        case 'mod':
            var result = evalScheem(expr[1], env);
            for(var i = 2; i < expr.length; ++i)
            {
                result = result % evalScheem(expr[i], env);
            }
            return result;
        case 'define':
            if (expr[1] in env === false)
                env[expr[1]] = evalScheem(expr[2], env);
            else
                throw new Error("Attempting to redefine variable");
            return 0;
        case 'set!':
            if (expr[1] in env === true)
                env[expr[1]] = evalScheem(expr[2], env);
            else
                throw new Error("Attempting to set undefined variable");
            return 0;
        case 'if':
            if (evalScheem(expr[1]) === '#t')
            {
                return evalScheem(expr[2]);
            }
            return evalScheem(expr[3]);
    }
};

module.exports.evalScheem = evalScheem;
