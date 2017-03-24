(function(ext) {
    var device = null;
    var SpheroConnection;
    var SpheroStatus = 0;
    var SpheroAppID = getRequest().id?getRequest().id:"falgapmgoopapgbocigmjlclilgjgijb"; //unique app ID for Sphero Scratch App

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
        var response = {status: SpheroStatus}
        if (SpheroStatus==0) {response.msg = 'Chrome App not found'}
        else if (SpheroStatus == 1) {response.msg = 'Not Ready'}
        else {response.msg = 'Ready'};
        return response;
    };
    
    ext._shutdown = function() {

    }

    function getSpheroAppStatus() {
        chrome.runtime.sendMessage(SpheroAppID, {message: "Status"}, function (response) {
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
                    console.log(SpheroConnection);
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