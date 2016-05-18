var enable = false;

function debug() {
    if (enable) {
        console.log.apply(null, arguments);
    }
}

function enableDebugLog() {
    enable = true;
}

function disableDebugLog() {
    enable = false;
}

module.exports = {
    debug: debug,
    enableDebugLog: enableDebugLog,
    disableDebugLog: disableDebugLog,
}
