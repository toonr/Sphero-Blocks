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

    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        if (dev.id == "COM8" && !connected) {
            console.log("test");
            device = Cylon.robot({
                        connections: {
                            bluetooth: { adaptor: 'sphero', port: 'COM8' }
                        },

                        devices: {
                            sphero: { driver: 'sphero' }
                        },

                        work: function(my) {
                            connected = true;
                            console.log("Sphero connected");
                        }
                     });
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