'use strict';
var path = require('path');

module.exports = function (grunt) {

    var port = 3020;

    // Project configuration.
    grunt.initConfig({
        mocha_istanbul: {
            options: {
                require: [],
                reporter: 'spec',
                bail: true,
                timeout: 12000
            },
            src:['test/server/**/*.js']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            app: {
                src: ['src/**/*.js', "!src/public/lib/**/*.js", "!src/public/javascripts/vendor/**/*.js"]
            },
            test: {
                src: ['test/**/*.js', "!test/client/**/*.js",]
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            app: {
                files: '<%= jshint.app.src %>',
                tasks: ['jshint:app', 'nodeunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'nodeunit']
            }
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js',
                singleRun: true
            },

            watch: {
                configFile: 'config/karma.conf.js',
                singleRun: false,
                autoWatch: true,
                browsers: ['PhantomJS']
            },

            e2e: {
                configFile: 'config/karma-e2e.conf.js',
                singleRun: true,
                autoWatch: false,
                proxies: {
                    '/': 'http://localhost:' + port + '/'
                }
            }
        },
        express: {
            server: {
                options: {
                    hostname: 'localhost',
                    port: port,
                    bases: path.resolve('./src/public'),
                    server: path.resolve('./src/app')
                }
            }
        },
        env: {
            options: {
                //Shared Options Hash
            },
            test: {
                NODE_ENV: 'test'
            },
            dev: {
                NODE_ENV: 'development'
            },
            build: {
                NODE_ENV: 'production'
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // note: to run karma in continuous (autowatch) mode, run it directly:
    // unit tests:
    //      karma start config/karma.conf.js
    // e2e tests:
    //      karma start config/karma-e2e.conf.js
    grunt.registerTask('default', ['env:test', 'jshint:app', 'test', 'e2e']);
    grunt.registerTask('e2e', ['env:test', 'express', 'karma:e2e']);
    grunt.registerTask('test', ['env:test', 'mocha_istanbul', 'karma:unit']);
};
