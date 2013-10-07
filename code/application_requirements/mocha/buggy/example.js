function UserService(options) {
    options = options || new Options();
    if(options.https) {
        this.protocol = 'https';
    } else {
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
        value: false
    });
    // other properties...
    Object.seal(this);
}

module.exports.Options = exports.Options = Options;
module.exports.UserService = exports.UserService = UserService;
