function UserService(options) {
    options = options || new Options();
    this.protocol = 'https';
    if(options.https === false) {
        // dev purposes only
        this.protocol = 'http';
    }
}

UserService.prototype.GET = function() {
    // some ajax call for GET requests, returns json
};

// imagine this code is separated here by 1000s of lines
// or separate directories...

function Options() {
    Object.defineProperty(this, 'https', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: true
    });
    // other properties...
    Object.seal(this);
}

module.exports.Options = exports.Options = Options;
module.exports.UserService = exports.UserService = UserService;
