(function(ext) {
    var device = null;
    var connected = false;
    var Cylon = require('cylon');

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if(!connected) return {status: 1, msg: 'Device not connected'};
        return {status: 2, msg: 'Device connected'};
    }

    ext._deviceConnected = function(dev) {
            console.log("test1");
        if (dev.id == "COM8" && !device) {
            device = dev;
            dev.open({ stopBits: 0, bitRate: 38400, ctsFlowControl: 0 }, function() { console.log("test"); });
            dev.close();
            // device = Cylon.robot({
            //             connections: {
            //                 bluetooth: { adaptor: 'sphero', port: dev.id }
            //             },

            //             devices: {
            //                 sphero: { driver: 'sphero' }
            //             },

            //             work: function(my) {
            //                 connected = true;
            //                 console.log("Sphero connected");
            //             }
            //          });
            // device.start();
        };
    };

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

    var serial_info = {type: 'serial'};
    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext, serial_info);
})({});