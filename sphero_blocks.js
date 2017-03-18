(function(ext) {
    var device = null;

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'Device not connected'};
        return {status: 2, msg: 'Device connected'};
    }

    ext._deviceConnected = function(dev) {
        if(device) return;
        console.log("_deviceConnected");
        device = dev;
        device.open(deviceOpened);
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