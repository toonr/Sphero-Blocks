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

    ext.timed_roll = function(speed, direction, time, callback) {
        console.log("Timed Roll called");
        if (time > 0) {
            if (direction > 359) {
                chrome.runtime.sendMessage(SpheroAppID, {message: "Timed roll", speed: speed, direction: 359, time: time});
            }
            else if (direction < 0) {
                chrome.runtime.sendMessage(SpheroAppID, {message: "Timed roll", speed: speed, direction: 0, time: time});
            }
            else {
                chrome.runtime.sendMessage(SpheroAppID, {message: "Timed roll", speed: speed, direction: direction, time: time});
            };
            window.setTimeout(function() {
                callback();
            }, time*1000);
        }
    };

    ext.stop = function() {
        console.log("Stop called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Stop"});
    };

    // Check the language
    var paramString = window.location.search.replace(/^\?|\/$/g, '');
    var vars = paramString.split("&");
    var lang = 'en';
    for (var i=0; i<vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair.length > 1 && pair[0]=='lang')
          lang = pair[1];
    }

    var blocks = {
    en: [
            [' ', 'Change color to %m.colors', 'change_color', 'blue'],
            [' ', 'Change to a random color', 'random_color'],
            ['-'],
            [' ', 'Roll with speed %n in direction %n', 'roll', 60, 0],
            ['w', 'Roll with speed %n in direction %n during %n seconds', 'timed_roll', 60, 0, 1],
            [' ', 'Stop rolling', 'stop']
        ],
    nl: [
            [' ', 'Verander kleur naar %m.colors', 'change_color', 'blauw'],
            [' ', 'Verander naar een willekeurige kleur', 'random_color'],
            ['-'],
            [' ', 'Rol met snelheid %n in richting %n', 'roll', 60, 0],
            ['w', 'Rol met snelheid %n in richting %n gedurende %n seconden', 'timed_roll', 60, 0, 1],
            [' ', 'Stop met rollen', 'stop']
        ],
    fr: [
            [' ', 'Change la couleur %m.colors', 'change_color', 'bleu'],
            [' ', 'Change la couleur arbitrairement', 'random_color'],
            ['-'],
            [' ', 'Roule avec vitesse %n dans la direction %n', 'roll', 60, 0],
            ['w', 'Roule avec vitesse %n dans la direction %n pendant %n secondes', 'timed_roll', 60, 0, 1],
            [' ', 'Arrête avec rouler', 'stop']
        ]
    };

    var menus = {
    en: {
            colors: ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'gold']
        },
    nl: {
        colors: ['blauw', 'rood', 'groen', 'geel', 'paars', 'roos', 'oranje', 'wit', 'goud']
        },
    fr: {
        colors: ['bleu', 'rouge', 'vert', 'jaune', 'violet', 'rose', 'orange', 'blanc', 'or']
        }
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: blocks[lang],
        menus: menus[lang],
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