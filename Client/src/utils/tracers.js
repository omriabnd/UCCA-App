var fullTrace = function() {
    console.debug.apply(this, arguments);
    // console.trace();
};

var emptyTrace = function() { };

var storageKey="ucca.diaganostics";

setTrace = function(on) {
    trace = !!on ? fullTrace : emptyTrace;
    window.localStorage.setItem(storageKey, !!on ? "on": "off");
};

getTrace = function() {
    var value = window.localStorage.getItem(storageKey);
    return value==="on";
};

setTrace(getTrace());