(function(ext) {
    var device = null;
    var status = false;
    var SpheroConnection;
    var SpheroStatus = 0;
    var SpheroAppID = getRequest().id?getRequest().id:"falgapmgoopapgbocigmjlclilgjgijb"; //unique app ID for Sphero Scratch App
    //var Cylon = require('cylon');

    ext.my_first_block = function() {
        console.log("test");
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'my first block', 'my_first_block']
        ],
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
        return {status: SpheroStatus, msg: SpheroStatus==2?'Ready':'Not Ready'};
    };
    ext._shutdown = function() {
        //if(poller) poller = clearInterval(poller);
        status = false;
    }
    function getSpheroAppStatus() {
        chrome.runtime.sendMessage(SpheroAppID, {message: "STATUS"}, function (response) {
            if (response === undefined) { //Chrome app not found
                console.log("Chrome app not found");
                SpheroStatus = 0;
                setTimeout(getSpheroAppStatus, 1000);
            }
            else if (response.status === false) { //Chrome app says not connected
                SpheroStatus = 1;
                setTimeout(getSpheroAppStatus, 1000);
            }
            else {// successfully connected
                if (SpheroStatus !==2) {
                    console.log("Connected");
                    SpheroConnection = chrome.runtime.connect(SpheroAppID);
                    SpheroConnection.onMessage.addListener(onMsgApp);
                }
                SpheroStatus = 2;
                setTimeout(getSpheroAppStatus, 1000);
            }
        });
    };
    function onMsgApp(msg) {
        var buffer = msg.buffer;
        for(var i=0;i<buffer.length;i++){
            //onParse(buffer[i]);
        }
    };
    getSpheroAppStatus();
    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext);
})({});