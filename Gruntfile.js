/*global module:false*/
module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! \n' +
					' * <%= pkg.name %> v<%= pkg.version %> [<%= grunt.template.today("yyyy-mm-dd") %>] \n' +
					' * <%= pkg.description %> \n' +
					' * <%= pkg.author %> \n' +
					' */ \n\n'
		},
		// Watcher
		watch: {
			scripts: {
				files: [
					'js/src/**.js',
					'js/src/*/**.js'
				],
				tasks: [
					'newer:jshint:target',
					'newer:concat:target',
					'newer:includereplace:target'
				]
			},
			styles: {
				files: [
					'css/src/**.css',
					'css/src/*/**.css',
					'css/src/**.less',
					'css/src/*/**.less'
				],
				tasks: [
					'newer:less:target',
					'newer:stripmq:all'
				]
			}
		},
		// Newer
		newer: {
			options: {
				override: function(details, include) {
					if (details.task === 'less') {
						checkForNewerImports(details.path, details.time, include);
					} else {
						include(false);
					}
				}
			}
		},
		// JS Hint
		jshint: {
			target: {
				src: [
					'js/src/**.js',
					'js/src/*/**.js'
				],
				options: {
					ignores: '<%= pkg.js_ignores %>',
					globals: {
						'jQuery'   : true,
						'$'        : true,
						'WWW_ROOT' : true
					},
					'-W003':   true, // used before defined
					devel:     true, // allow console
					browser:   true,
					curly:     true,
					eqeqeq:    true,
					forin:     true,
					freeze:    true,
					immed:	   true,
					latedef:   true,
					newcap:    true,
					noarg:     true,
					nonew:     true,
					smarttabs: true,
					sub:       true,
					undef:     true,
					validthis: true
				}
			}
		},
		// Uglify - For production
		uglify: {
			options: {
				banner: '<%= meta.banner %>',
				report: 'min'
			},
			target: {
				files: '<%= pkg.js %>'
			}
		},
		// Concat - For development
		concat: {
			target: {
				files: '<%= pkg.js %>'
			}
		},
		// Replace
		includereplace: {
			target: {
				options: {
					prefix: '@',
					globals: '<%= pkg.vars %>'
				},
				dest: 'js/',
				src: '*.js',
				expand: true,
				cwd: 'js/'
			}
		},
		// LESS
		less: {
			target: {
				options: {
					report: 'min',
					cleancss: true,
					modifyVars: '<%= pkg.vars %>',
					banner: '<%= meta.banner %>'
				},
				files: '<%= pkg.css %>'
			}
		},
		// Conbine MQs
		cmq: {
			target: {
				files: {
					'css': [ 'css/*.css' ]
				}
			}
		},
		// Auto Prefixer
		autoprefixer: {
			options: {
				borwsers: [ '> 1%', 'last 5 versions', 'Firefox ESR', 'Opera 12.1', '>= ie 8' ]
			},
			no_dest: {
				 src: 'css/*.css'
			}
		},
		// Strip MQ
		stripmq: {
			options: {
				width: 980,
				type: 'screen'
			},
			all: {
				files: {
					'css/site.ie8.css': [ 'css/site.ie8.css' ]
				}
			}
		}
	});

	// Newer LESS Imports
	function checkForNewerImports(lessFile, mTime, include) {
		var fs = require('fs'),
			path = require('path');

		fs.readFile(lessFile, "utf8", function(err, data) {
			var lessDir = path.dirname(lessFile),
				regex = /@import "(.+?)(\.less)?";/g,
				shouldInclude = false,
				match;

			while ((match = regex.exec(data)) !== null) {
				var importFile = lessDir + '/' + match[1] + '.less';
				if (fs.existsSync(importFile)) {
					var stat = fs.statSync(importFile);
					if (stat.mtime > mTime) {
						shouldInclude = true;
						break;
					}
				}
			}

			include(shouldInclude);
		});
	}

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-combine-media-queries');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-stripmq');

	// Default task
	grunt.registerTask('default', [ 'css', 'js' ]);

	// CSS
	grunt.registerTask('css', [ 'less', /* 'cmq', */ 'autoprefixer', 'stripmq' ]);

	// JS
	grunt.registerTask('js', [ 'jshint', 'uglify', 'includereplace' ]);

};