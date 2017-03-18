(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext._deviceConnected = function(dev) {
        if(device) return;
        console.log("_deviceConnected");
        device = dev;
        device.open(deviceOpened);
        status = true;
    };

    ext.my_first_block = function() {
        console.log("test");
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'my first block', 'my_first_block']
        ],
        url: 'https://github.com/toonr/Sphero-Blocks'
    };

    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext);
})({});