(function(ext) {
    var SpheroConnection = null;
    var SpheroStatus = 0;
    var SpheroAppID = getRequest().id?getRequest().id:"falgapmgoopapgbocigmjlclilgjgijb"; //unique app ID for Sphero Scratch App

    ext.change_color = function(color) {
        console.log("Change Color called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Change color", color: color});
    };

    ext.random_color = function() {
        console.log("Random Color called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Random color"});
    };

    ext.roll = function(speed, direction) {
        console.log("Roll called");
        if (direction > 359) {
            chrome.runtime.sendMessage(SpheroAppID, {message: "Roll", speed: speed, direction: 359});
        }
        else if (direction < 0) {
            chrome.runtime.sendMessage(SpheroAppID, {message: "Roll", speed: speed, direction: 0});
        }
        else {
            chrome.runtime.sendMessage(SpheroAppID, {message: "Roll", speed: speed, direction: direction});
        }
    };

    ext.roll_timer = function(speed, direction, time) {
        console.log("Roll Timer called");
        if (time > 0) {
            if (direction > 359) {
                chrome.runtime.sendMessage(SpheroAppID, {message: "Roll timer", speed: speed, direction: 359, time: time});
            }
            else if (direction < 0) {
                chrome.runtime.sendMessage(SpheroAppID, {message: "Roll timer", speed: speed, direction: 0, time: time});
            }
            else {
                chrome.runtime.sendMessage(SpheroAppID, {message: "Roll timer", speed: speed, direction: direction, time: time});
            }
        }
    };

    ext.stop = function() {
        console.log("Stop called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Stop"});
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'Change color to %m.colors', 'change_color', 'blue'],
            [' ', 'Change to a random color', 'random_color'],
            [' ', 'Roll with speed %n in direction %n', 'roll', 60, 0],
            [' ', 'Roll with speed %n in direction %n during %n seconds', 'roll_timer', 60, 0, 1],
            [' ', 'Stop rolling', 'stop']
        ],
        menus: {
            colors: ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'gold']
        },
        url: 'https://toonr.github.io/Sphero-Blocks/sphero_blocks.js'
    };

    function getRequest() {
        var url = location.search; 
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        if (str.indexOf("&") != -1) {
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        } else {
            theRequest[str.split("=")[0]] = unescape(str.split("=")[1]);
        }
        }
        return theRequest;
    }
   
    ext._getStatus = function() {
        var response = {status: SpheroStatus}
        if (SpheroStatus==0) {response.msg = 'Chrome App not found'}
        else if (SpheroStatus == 1) {response.msg = 'Not Ready'}
        else {response.msg = 'Ready'};
        return response;
    };

    function getSpheroAppStatus() {
        chrome.runtime.sendMessage(SpheroAppID, {message: "Status"}, function (response) {
            if (response === undefined) { //Chrome app not found
                SpheroStatus = 0;
                setTimeout(getSpheroAppStatus, 1000);
            }
            else if (response.status === false) { //Chrome app says not connected
                SpheroStatus = 1;
                setTimeout(getSpheroAppStatus, 1000);
            }
            else {// successfully connected
                if (SpheroStatus !==2) {
                    SpheroConnection = chrome.runtime.connect(SpheroAppID);
                }
                SpheroStatus = 2;
                setTimeout(getSpheroAppStatus, 1000);
            }
        });
    };

    getSpheroAppStatus();

    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext);
})({});