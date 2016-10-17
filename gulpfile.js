const fs = require('fs');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const cache = require('gulp-cache');
const { execSync } = require('child_process');

const eslintCache = new cache.Cache({ cacheDirName: 'eslint-cache' });

const eslintVersion = [
	'dependencies',
	'gulp-eslint',
	'dependencies',
	'eslint',
	'version',
].reduce((acc, curr) => acc[curr], JSON.parse(execSync('npm ls eslint --json').toString()));

function makeEslintCacheKey (file) {
	return [ file.contents.toString('utf8'), fs.readFileSync('.eslintrc'), eslintVersion ].join('');
}

gulp.task('clean', (done) => {
	eslintCache.clear(undefined, done);
});

gulp.task('lint', () => {
	return gulp.src('./src/*.js')
		.pipe(cache(eslint(), {
			key: makeEslintCacheKey,
			fileCache: eslintCache,
			success: ({ eslint: { errorCount, warningCount } }) => errorCount + warningCount === 0,
		}))
		.pipe(eslint.format());
});

gulp.task('watch', [ 'lint' ], () => gulp.watch('./src/*.js', [ 'lint' ]));

gulp.task('default', [ 'watch' ]);
