
var nodeCount = function(tree) {
};

var nodeInsert = function(value, tree) {
};

var fib = function(n) {
    return trampoline(fibThunk(n, thunkValue));
};

var fibThunk = function(n, cont) {
    if (n === 1 || n === 2) {
        return thunk(cont, [1]);
    }
    else {
        var new_cont = function(v) {
            var new_cont_inner = function(v2) {
                return cont(v + v2);
            };
            return fibThunk(n - 2, new_cont_inner);
        };
        return fibThunk(n - 1, new_cont);
    }
};

var generateList = function(length) {

    var current = null;

    for(var i = length; i > 0; --i)
    {
        if (current)
        {
            current = {
                val: i,
                next: current
            };
        }
        else
        {
            current = {
                val: i,
                next: null
            };
        }
    }
    
    return current;
};

var listLength = function(list) {
    return trampoline(listLengthThunk(list, thunkValue));
};

var listLengthThunk = function(list, cont) {
    if (list.next === null) {
        return thunk(cont, [1]);
    }
    else {
        var new_cont = function(v) {
            return thunk(cont, [v + 1]);
        };
        return thunk(listLengthThunk, [list.next, new_cont]);
    }
};

var listLookup = function(n, list) {
    return trampoline(listLookupThunk(n, list, thunkValue));
};

var listLookupThunk = function(n, list, cont) {
    if (n === 0) {
        return thunk(cont, [list.val]);
    }
    else {
        var new_cont = function(v) {
            return thunk(cont, [v]);
        };
        return thunk(listLookupThunk, [n - 1, list.next, new_cont]);
    }
};

var listReverse = function(list) {
    return trampoline(listReverseThunk(list, null, thunkValue));
};

var listReverseThunk = function(list, accumulator, cont) {
    if (list === null) {
        return thunk(cont, [accumulator]);
    }
    else {
        var new_cont = function(v) {
            return thunk(cont, [v]);
        };

        var newAccumulator = {
            val: list.val,
            next: accumulator
        };

        var newHead = list.next;

        return thunk(listReverseThunk, [newHead, newAccumulator, new_cont]);
    }
};

//Internal functions

var trampoline = function(thk) {
    while (true) {
        if (thk.tag === "value") {
            return thk.val;
        }
        if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        }
    }
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var thunk = function (f, lst) {
    return { tag: "thunk", func: f, args: lst };
};

if (typeof module !== 'undefined') {
    module.exports.nodeCount = nodeCount;
    module.exports.nodeInsert = nodeInsert;
    module.exports.fib = fib;
    module.exports.generateList = generateList;
    module.exports.listLength = listLength;
    module.exports.listLookup = listLookup;
    module.exports.listReverse = listReverse;
}
