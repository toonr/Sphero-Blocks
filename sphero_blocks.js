(function(ext) {
    var SpheroConnection = null;
    var SpheroStatus = 0;
    var SpheroAppID = "falgapmgoopapgbocigmjlclilgjgijb"; //unique app ID for Sphero Scratch App

    // Check the language
    var paramString = window.location.search.replace(/^\?|\/$/g, '');
    var vars = paramString.split("&");
    var lang = null;

    check_valid_color_value = function(value) {
        if (value > 255) { return 255; }
        else if (value < 0) { return 0; }
        else { return value; }
    };

    check_valid_direction = function(dir) {
        if (dir > 359) { return 359; }
        else if (dir < 0) { return 0; }
        else { return dir; }
    };

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

    ext.rgb_color = function(r, g, b) {
        console.log("RGB Color called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "RGB color", rgb: {red: check_valid_color_value(r),
                                                                             green: check_valid_color_value(g),
                                                                             blue: check_valid_color_value(b)}});
    };

    ext.roll_current_dir = function(speed, direction) {
        console.log("Roll in Current Direction called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Roll in Current Direction", speed: speed});
    };

    ext.roll = function(speed, direction) {
        console.log("Roll called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Roll", speed: speed, direction: check_valid_direction(direction)});
    };

    ext.timed_roll = function(speed, direction, time, callback) {
        console.log("Timed Roll called");
        if (time > 0) {
            chrome.runtime.sendMessage(SpheroAppID, {message: "Timed roll", speed: speed, direction: check_valid_direction(direction), time: time});
            window.setTimeout(function() {
                callback();
            }, time*1000);
        }
    };

    ext.stop = function() {
        console.log("Stop called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Stop"});
    };

    ext.set_direction = function(direction) {
        console.log("Set Direction called");
        chrome.runtime.sendMessage(SpheroAppID, {message: "Set direction", dir: check_valid_direction(direction)});
    };

    ext.set_stabilization = function(mode) {
        console.log("Set Stabilization called");
        if (lang === 'en') {
            chrome.runtime.sendMessage(SpheroAppID, {message: "Set stabilization", mode: mode});
        } else {
            var modeIdx = menus[lang].stabilization.indexOf(mode),
                englishMode = menus['en'].stabilization[modeIdx];
            chrome.runtime.sendMessage(SpheroAppID, {message: "Set stabilization", mode: englishMode});
        }
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
            [' ', 'Set color to red: %n, green: %n and blue: %n', 'rgb_color', 0, 0, 0],
            ['-'],
            ['-'],
            [' ', 'Roll with speed %n in current direction', 'roll_current_dir', 90],
            [' ', 'Roll with speed %n in direction %n', 'roll', 90, 0],
            ['w', 'Roll with speed %n in direction %n during %n seconds', 'timed_roll', 90, 0, 1],
            [' ', 'Stop rolling', 'stop'],
            [' ', 'Set direction to %n', 'set_direction', 0],
            ['-'],
            ['-'],
            [' ', 'Set stabilization %m.stabilization', 'set_stabilization', 'on'],
            ['-'],
            ['-'],
            [' ', 'On collision do', 'on_collision'],
            [' ', 'End of collision commands', 'end_collision'],
            [' ', 'Stop collision detection', 'stop_collision']
        ],
    nl: [
            [' ', 'Verander kleur naar %m.colors', 'change_color', 'blauw'],
            [' ', 'Verander naar een willekeurige kleur', 'random_color'],
            [' ', 'Verander kleur naar rood: %n, groen: %n en blauw: %n', 'rgb_color', 0, 0, 0],
            ['-'],
            ['-'],
            [' ', 'Rol met snelheid %n in de huidige richting', 'roll_current_dir', 90],
            [' ', 'Rol met snelheid %n in richting %n', 'roll', 90, 0],
            ['w', 'Rol met snelheid %n in richting %n gedurende %n seconden', 'timed_roll', 90, 0, 1],
            [' ', 'Stop met rollen', 'stop'],
            [' ', 'Verander de richting naar %n', 'set_direction', 0],
            ['-'],
            ['-'],
            [' ', 'Zet de stabilisatie %m.stabilization', 'set_stabilization', 'aan'],
            ['-'],
            ['-'],
            [' ', 'Bij botsing doe', 'on_collision'],
            [' ', 'Einde van botsing commando\'s', 'end_collision'],
            [' ', 'Stop botsing detectie', 'stop_collision']
        ],
    fr: [
            [' ', 'Changez la couleur %m.colors', 'change_color', 'bleu'],
            [' ', 'Changez la couleur arbitrairement', 'random_color'],
            [' ', 'Changez la couleur à rouge: %n, vert: %n et bleu: %n', 'rgb_color', 0, 0, 0],
            ['-'],
            ['-'],
            [' ', 'Roulez avec vitesse %n dans la direction actuelle', 'roll_current_dir', 90],
            [' ', 'Roulez avec vitesse %n dans la direction %n', 'roll', 90, 0],
            ['w', 'Roulez avec vitesse %n dans la direction %n pendant %n secondes', 'timed_roll', 90, 0, 1],
            [' ', 'Arrêtez avec rouler', 'stop'],
            [' ', 'Changez la direction à %n', 'set_direction', 0],
            ['-'],
            ['-'],
            [' ', '%m.stabilization la stabilisation', 'set_stabilization', 'Commencez'],
            ['-'],
            ['-'],
            [' ', 'En cas de collision', 'on_collision'],
            [' ', 'Fin des commandes de collision', 'end_collision'],
            [' ', 'Arrêtez la détection de collision', 'stop_collision']
        ]
    };

    var menus = {
    en: {
            colors: ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'gold'],
            stabilization: ['on', 'off']
        },
    nl: {
            colors: ['blauw', 'rood', 'groen', 'geel', 'paars', 'roos', 'oranje', 'wit', 'goud'],
            stabilization: ['aan', 'uit']
        },
    fr: {
            colors: ['bleu', 'rouge', 'vert', 'jaune', 'violet', 'rose', 'orange', 'blanc', 'or'],
            stabilization: ['Commencez', 'Arrêtez']
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
            } else if (response.status === false) { //Chrome app says not connected
                SpheroStatus = 1;
                if (lang != response.language) {
                    lang = response.language;

                    // Unregister the extension
                    ScratchExtensions.unregister('Sphero SPRK');

                    registerNewLanguage(lang);
                }
                setTimeout(getSpheroAppStatus, 1000);
            } else {// successfully connected
                if (SpheroStatus !==2) {
                    SpheroConnection = chrome.runtime.connect(SpheroAppID);
                }
                SpheroStatus = 2;
                if (lang != response.language) {
                    lang = response.language;

                    // Unregister the extension
                    ScratchExtensions.unregister('Sphero SPRK');

                    registerNewLanguage(lang);
                }
                setTimeout(getSpheroAppStatus, 1000);
            }
        });
    };

    function registerNewLanguage(lang) {
        var descriptor = {
            blocks: blocks[lang],
            menus: menus[lang],
            url: 'https://toonr.github.io/Sphero-Blocks/sphero_blocks.js'
        };

        // Register the extension
        ScratchExtensions.register('Sphero SPRK', descriptor, ext);
    };

    function getSpheroAppLanguage() {
        chrome.runtime.sendMessage(SpheroAppID, {message: "Language"}, function (response) {
             if (response === undefined) { // Default language is English if chrome app can't be found.
                lang = 'en';
             } else {
                lang = response.language;
             }

            // Descriptor defined and extension registered AFTER getting the language, so the right language is set for the blocks.
            registerNewLanguage(lang);
        });
    };

    getSpheroAppStatus();
    getSpheroAppLanguage();
})({});