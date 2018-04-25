'use strict';
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            AudioPlayer: {
                src: ['src/AudioPlayer.js'],
                dest: 'dist/AudioPlayer.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            js: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js', 'test/tests.js']
            },
        },
        qunit: {
            options: {
                '--web-security': 'no',
                '--local-to-remote-url-access': 'yes'
            },
            all: ['test/passfail.html']
        },
        'closure-compiler': {
            audioplayer_debug: {
                closurePath: 'support/google-closure-compiler',
                js: 'dist/AudioPlayer.js',
                jsOutputFile: 'dist/AudioPlayer.js',
                options: {
                    formatting: 'PRETTY_PRINT',
                    compilation_level: 'WHITESPACE_ONLY'
                }
            },
            audioplayer_minimized: {
                closurePath: 'support/google-closure-compiler',
                js: 'dist/AudioPlayer.js',
                jsOutputFile: 'dist/AudioPlayer.min.js',
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS'
                }
            },
        },
        jsdoc: {
            sigplot: {
                src: ['js/*.js'],
                options: {
                    destination: 'doc',
                    template: 'docstrap-master/template',
                    configure: 'docstrap-master/conf.json'
                }
            }
        },
        clean: {
            build: ["dist/**/*", "!dist/*.zip"]
        },
        compress: {
            main: {
                options: {
                    archive: "dist/audioplot-<%= pkg.version %>-<%= grunt.template.today('yyyy-mm-dd') %>.zip",
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['*-debug.js'],
                    dest: 'audioplot-<%= pkg.version %>'
                }, {
                    expand: true,
                    cwd: 'dist/',
                    src: ['*-min.js'],
                    dest: 'audioplot-<%= pkg.version %>'
                }, {
                    src: ['doc/**/*'],
                    dest: 'audioplot-<%= pkg.version %>'
                }]
            }
        },
        replace: {
            version: {
                src: ["dist/*.js"],
                overwrite: true,
                replacements: [{
                    from: /version-PLACEHOLDER/g,
                    to: "<%= pkg.version %>",
                }],
            },
        },
        web_server: {
            options: {
                cors: true,
                nevercache: true,
                logRequests: true
            },
            foo: 'bar' // necessary for some odd reason, see the docs
        },
        jsbeautifier: {
            check: {
                // Only check a subset of the files
                src: ['src/**'],
                options: {
                    mode: "VERIFY_ONLY",
                    eol: "\n"
                }
            },
            cleanup: {
                // Only cleanup a subset of the files
                src: ['src/**'],
                options: {
                    indentSize: 4,
                    indentWithTabs: false,
                    wrapLineLength: 0,
                    eol: "\n"
                }
            }
        },
        express: {
            test: {
                options: {
                    script: 'benchmark/express.js'
                }
            }
        },
        karma: {
            bench: {
                configFile: 'karma.conf.js'
            }
        },
        browserify: {
            AudioPlayer: {
                src: 'src/AudioPlayer.js',
                dest: 'dist/AudioPlayer.js',
                options: {
                    browserifyOptions: {
                        standalone: 'AudioPlayer'
                    }
                }
            }
        }
    });
    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-web-server');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.registerTask('build', ['jsbeautifier:check', 'jshint', 'browserify', 'replace']);
    // Check everything is good
    grunt.registerTask('test', ['build', 'qunit']);
    // Build a distributable release
    grunt.registerTask('dist', ['clean', 'compress']);
    // Default task.
    grunt.registerTask('default', 'test');
    // Benchmark in browsers.
    grunt.registerTask('benchtest', ['express:test', 'karma:bench']);
    grunt.registerTask('build_and_test', ['build', 'benchtest']);
};