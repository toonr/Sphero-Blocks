(function(ext) {
    var SpheroConnection = null;
    var SpheroStatus = 0;
    var SpheroAppID = "falgapmgoopapgbocigmjlclilgjgijb"; //unique app ID for Sphero Scratch App

    // Check the language
    var paramString = window.location.search.replace(/^\?|\/$/g, '');
    var vars = paramString.split("&");
    var lang = 'en';

    ext.change_color = function(color) {
        console.log("Change Color called");
        if (lang === 'en') {
            chrome.runtime.sendMessage(SpheroAppID, {message: "Change color", color: color});
        } else {
            var colorIdx = menus[lang].colors.indexOf(color),
                englishColor = menus['en'].colors[colorIdx];
            chrome.runtime.sendMessage(SpheroAppID, {message: "Change color", color: englishColor});
        }
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

    ext.on_collision = function() {
        console.log("On collision called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "On collision"});
    };

    ext.end_collision = function() {
        console.log("End collision called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "End collision"});
    };

    ext.stop_collision = function() {
        console.log("Stop collision called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Stop collision"});
    };

    var blocks = {
    en: [
            [' ', 'Change color to %m.colors', 'change_color', 'blue'],
            [' ', 'Change to a random color', 'random_color'],
            ['-'],
            ['-'],
            [' ', 'Roll with speed %n in direction %n', 'roll', 90, 0],
            ['w', 'Roll with speed %n in direction %n during %n seconds', 'timed_roll', 90, 0, 1],
            [' ', 'Stop rolling', 'stop'],
            ['-'],
            ['-'],
            [' ', 'On collision do', 'on_collision'],
            [' ', 'End of collision commands', 'end_collision'],
            [' ', 'Stop collision detection', 'stop_collision']
        ],
    nl: [
            [' ', 'Verander kleur naar %m.colors', 'change_color', 'blauw'],
            [' ', 'Verander naar een willekeurige kleur', 'random_color'],
            ['-'],
            ['-'],
            [' ', 'Rol met snelheid %n in richting %n', 'roll', 90, 0],
            ['w', 'Rol met snelheid %n in richting %n gedurende %n seconden', 'timed_roll', 90, 0, 1],
            [' ', 'Stop met rollen', 'stop'],
            ['-'],
            ['-'],
            [' ', 'Bij botsing doe', 'on_collision'],
            [' ', 'Einde van botsing commando\'s', 'end_collision'],
            [' ', 'Stop botsing detectie', 'stop_collision']
        ],
    fr: [
            [' ', 'Change la couleur %m.colors', 'change_color', 'bleu'],
            [' ', 'Change la couleur arbitrairement', 'random_color'],
            ['-'],
            [' ', 'Roule avec vitesse %n dans la direction %n', 'roll', 90, 0],
            ['w', 'Roule avec vitesse %n dans la direction %n pendant %n secondes', 'timed_roll', 90, 0, 1],
            [' ', 'Arrête avec rouler', 'stop'],
            ['-'],
            [' ', 'En cas de collision', 'on_collision'],
            [' ', 'Fin des commandes de collision', 'end_collision'],
            [' ', 'Arrête la détection de collision', 'stop_collision']
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
                lang = response.language;
                setTimeout(getSpheroAppStatus, 1000);
            }
            else {// successfully connected
                if (SpheroStatus !==2) {
                    SpheroConnection = chrome.runtime.connect(SpheroAppID);
                }
                SpheroStatus = 2;
                lang = response.language;
                setTimeout(getSpheroAppStatus, 1000);
            }
        });
    };

    getSpheroAppStatus();

    // Block and block menu descriptions
    setTimeout(function(){
      var descriptor = {
        blocks: blocks[lang],
        menus: menus[lang],
        url: 'https://toonr.github.io/Sphero-Blocks/sphero_blocks.js'
      };

      // Register the extension
      ScratchExtensions.register('Sphero SPRK', descriptor, ext);
    }, 5000);
})({});