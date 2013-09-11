tsc = "~/.typescript/bin/tsc"

module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        typescript:
            compile:
                src: ['compiled/fivefold.ts']
                dest: 'compiled/fivefold.js'
                options:
                    module: 'commonjs'
                    target: 'es3'
                    # sourcemap: true
                    declaration: true

            test:
                src: ['test/**/*.ts']
                dest: 'compiled'
                options:
                    module: 'commonjs'
                    target: 'es3'
        clean:
            type:
                src: ['compiled/**/*.js', 'compiled/*']
            build:
                src: ['build/**/*.js']

        concat:
            fivefold:
                src: [
                    'src/intro.ts'
                    'src/util/is-function.ts'
                    'src/util/is-JQuery-Object.ts'
                    'src/util/proxy.ts'
                    'src/util/log.ts'
                    'src/util/realizer.ts'
                    'src/view.ts'
                    'src/layout.ts'
                    'src/controller.ts'
                    'src/action.ts'
                    'src/route.ts'
                    'src/error.ts'
                    'src/history.ts'
                    'src/route-resolver.ts'
                    'src/router.ts'
                    'src/outro.ts'
                ]
                dest: 'compiled/fivefold.ts'

            dts:
                src: [
                    'etc/reference.d.ts'
                    'compiled/fivefold.d.ts'
                ]
                dest: 'build/fivefold.d.ts'

            licence:
                src: [
                    'etc/licence.js',
                    'compiled/fivefold.js'
                ]
                dest: 'build/fivefold.js'

            licenceMin:
                src: [
                    'etc/licence.js',
                    'compiled/fivefold.min.js'
                ]
                dest: 'build/fivefold.min.js'

        uglify:
            min:
                files:
                    'compiled/fivefold.min.js': ['compiled/fivefold.js']
        regarde:
            src:
                files: ['src/**/*.*']
                tasks: ['generate']


    grunt.loadNpmTasks 'grunt-typescript'
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-connect'
    grunt.loadNpmTasks 'grunt-regarde'

    grunt.registerTask 'compile', ['concat:fivefold','typescript:compile', 'typescript:test']
    grunt.registerTask 'default', ['compile']
    grunt.registerTask 'build', ['compile', 'uglify', 'concat:dts', 'concat:licence', 'concat:licenceMin']
