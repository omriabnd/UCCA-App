var fullTrace = function() {
    console.debug.apply(this, arguments);
    // console.trace();
};

var emptyTrace = function() { };

var traceStorageKey="ucca.diaganostics.trace";

setTrace = function(on) {
    trace = !!on ? fullTrace : emptyTrace;
    window.localStorage.setItem(traceStorageKey, !!on ? "on": "off");
    this.getTrace()
};

getTrace = function() {
    var value = window.localStorage.getItem(traceStorageKey);
    return value==="on";
};

setTrace(getTrace());
