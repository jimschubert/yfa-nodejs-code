module.exports = function (config) {
    "use strict";

    config.set({

        frameworks: ["mocha", "chai"],

        basePath: '../',

        logLevel: config.LOG_INFO,

        port: 9876,

        files: [
            'src/public/javascripts/vendor/jquery-1.9.1.min.js',
            'src/public/javascripts/vendor/angular/angular.js',
            'src/public/javascripts/vendor/angular/angular-*.js',
            'test/lib/angular/angular-mocks.js',
            'src/public/javascripts/vendor/bootstrap.min.js',
            'src/public/javascripts/vendor/modernizr-*.min.js',
            'src/public/javascripts/vendor/ui-bootstrap-0.4.0.min.js',
            'src/public/javascripts/vendor/ui-bootstrap-tpls-0.4.0.min.js',
            'src/public/javascripts/**/*.js',
            'test/unit/**/*.js'
        ],

        exclude: [
            'src/public/javascripts/vendor/angular/angular-scenario.js',
            'src/public/javascripts/vendor/ui-bootstrap-0.4.0.js',
            'src/public/javascripts/vendor/ui-bootstrap-tpls-0.4.0.js'
        ],

        autoWatch: true,

        // for PhantomJS, see install instructions: http://phantomjs.org/download.html
        // also see: http://codecuriosity.com/blog/2013/01/30/install-phantomjs-on-ubuntu/
        browsers : ['Chrome'],

        junitReporter   : {
            outputFile: 'test_out/unit.xml',
            suite     : 'unit'
        },

        // preprocessors defines which files should be evaluated for coverage
        // *preprocessors and reporters are required to generate code coverage report*
        // We're not using the recursive pattern (**) because we don't want the
        // vendor directory and all angularjs app files are flat under javascripts
        preprocessors   : {
            'src/public/javascripts/*.js': ['coverage']
        },

        //     Possible Values:
        //     dots
        //     progress
        //     junit
        //     growl
        //     coverage
        reporters       : ['progress', 'coverage'],

        // coverageReporter.type
        //     Possible Values:
        //          html (default)
        //          lcov (lcov and html)
        //          lcovonly
        //          text
        //          text-summary
        //          cobertura (xml format supported by Jenkins)
        //     If you set type to text or text-summary, you may set the file option, like this.
        //          coverageReporter : {
        //              type : 'text',
        //              dir : 'coverage/',
        //              file : 'coverage.txt'
        //          }
        coverageReporter: {
            type: 'html',
            dir : 'coverage/'
        },

        proxies: {
            '/': 'http://localhost:3000/'
        },

        urlRoot: '/__karma__/'
    });
};
