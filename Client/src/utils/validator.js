var validateStorageKey="ucca.diaganostics.validate";

setValidate = function(on) {
    window.localStorage.setItem(validateStorageKey, !!on ? "on": "off");
    this.getTrace()
};

getValidate = function() {
    var value = window.localStorage.getItem(validateStorageKey);
    return value==="on";
};

setValidate(getValidate());
