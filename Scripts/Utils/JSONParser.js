function stringifyFucObj(jsonObj) {
    return JSON.stringify(jsonObj, function (k, v) {
        if (typeof v == "function")
            return v.toString();
        else
            return v;
    });
};

function parseFucStr(jstr) {
    var obj = JSON.parse(jstr);
    for (var item in obj) {
        var v = obj[item];
        if (typeof v === 'string' && v.indexOf('function') == 0) {
            //查找fuction
            var bodyStart = v.indexOf('{');
            var bodyEnd = v.lastIndexOf('}');
            var bodyStr = v.substring(bodyStart + 1, bodyEnd);
            var argStart = v.indexOf('(');
            var argEnd = v.indexOf(')');
            var args = argEnd - argStart == 1 ? "" : v.substring(argStart + 1, argEnd);
            obj[item] = new Function(args, bodyStr);
        }
    }
    return obj;
};
