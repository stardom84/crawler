var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')();

var pathExists = require('path-exists');


/**
 * Definitions
 */

function ts(filesRoot, filesGlob, filesDest, project) {
	var title = arguments.callee.caller.name;
	var result = gulp.src(filesGlob)
		.pipe(plugins.tslint())
		.pipe(plugins.tslint.report('verbose'))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.typescript(project));
	return result.js
		.pipe(gulp.dest(filesDest))
}

function tsSrc() {
	var filesRoot = 'src';
	var filesDest = "build";

	var tsProject = plugins.typescript.createProject(filesRoot + '/tsconfig.json', {
		typescript: require('typescript'),
		outFile: 'server.js'
	});
	var filesGlob = [
		(filesRoot + "/**/*.ts"),
		("!" + filesRoot + "/typings/**/*.ts")
	];

	if (pathExists.sync(filesRoot + '/typings/main.d.ts')) {
		filesGlob.push(filesRoot + '/typings/main.d.ts')
	}

	return ts(filesRoot, filesGlob, filesDest, tsProject);
}

function watch() {
	gulp.watch('src/*.{ts,css,html}', gulp.series(tsSrc));
}

/**
 * Public Tasks
 */

gulp.task('build', gulp.series(
	tsSrc, watch
));


/**
 * Watches
 */


