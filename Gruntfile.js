module.exports = function (grunt) {
    'use strict';

    // configuração do projeto
    var gruntConfig = {
        pkg: grunt.file.readJSON('package.json'),
        // Arquivos que serão concatenados (arquivos de origem e de destino)
        concat: {
            js: {
                src: ['static/js/module1.js', 'lib/module2.js', 'lib/plugin.js'],
                dest: 'dist/all.js'
            },
            css: {
                src: ['static/js/product_backlog.*.css', ],
                dest: 'dist/main.css'
            }
        },
        // Arquivos que serão minificados (arquivos de origem e de destino)
        min: {
            dist: {
                src: ['src/assets/js/main.js'],
                dest: 'src/assets/js/all.min.js'
            }
        },
        cssmin: {
            dist: {
                src: ['src/assets/css/main.css'],
                dest: 'src/assets/css/all.min.css'
            }
        },
        rsync: {
            dist: {
                src: './',
                dest: '../scrumforme_deploy',
                recursive: true,
                syncDest: true,
                exclude: ['main.*']
            },
            deploy: {
                src: '../scrumforme_deploy',
                dest: '/home/agenciax4/sites/scrumforme/',
                host: 'root@vagnersantana.com
        ',
                recursive: true,
                syncDest: true
            }
        },
    };

    grunt.initConfig(gruntConfig);

    // Carrega os plugins que proveem as tarefas especificadas no package.json.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Tarefa padrão que será executada se o Grunt
    // for chamado sem parâmetros.
    grunt.registerTask('default', 'concat min cssmin');
};