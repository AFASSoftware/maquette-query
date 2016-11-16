var gulp = require('gulp');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');

var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

var ts = require('gulp-typescript');
var plumber = require('gulp-plumber');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

var ONE_DAY = 24 * 60 * 60 * 1000;

var clearScreen = function () {
  if (path.separator === '/') {
    console.log('\033[2J\033[1;1H'); // linux
  } else {
    console.log('\033c'); // windows
  }
};

var setWatching = function (notify) {
  var gulp_src = gulp.src;
  gulp.src = function() {
    return gulp_src.apply(gulp, arguments)
      .pipe(plumber(function(error) {
        if (error) {
          console.error('Error (' + error.plugin + '): ' + error.message);
          if (notify) {
            notify(error.message);
          }
        } else {
          console.error('Error');
          if (notify) {
            notify('Error');
          }
        }
      })
    );
  };
};

var compile = function() {
  var configTypescript = require('./tsconfig.json').compilerOptions;
  configTypescript.typescript = require('typescript');
	return gulp.src(['src/**/*.ts', 'test/**/*.ts', 'typings/**/*.ts'])
    .pipe(sourcemaps.init())
		.pipe(ts(configTypescript))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: function (file) {
        return file.relative.split(path.sep).map(function () {
            return '..'
          }).join('/') + '/../';
      }
    }))
		.pipe(gulp.dest('build/js'));
};
gulp.task('compile', compile);

gulp.task('dist', ['compile'], function() {
  gulp.src('build/js/src/**/*.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('declaration', function() {
  var configTypescript = require('./tsconfig.json').compilerOptions;
  configTypescript.declaration = true;
  configTypescript.typescript = require('typescript');
	return gulp.src('src/**/*.ts')
		.pipe(ts(configTypescript))
    .dts
		.pipe(gulp.dest('dist'));
});

function inc(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json'])
    // bump the version number in those files
    .pipe(bump({ type: importance }))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))
    // **tag it in the repository**
    .pipe(tag_version());
}

// these tasks are called from scripts/release.js
gulp.task('bump-patch', [], function () { return inc('patch'); });
gulp.task('bump-minor', [], function () { return inc('minor'); });
gulp.task('bump-major', [], function () { return inc('major'); });

gulp.task('test', ['compile'], function() {
  return gulp.src(['build/js/test/**/*.js'], {read: false})
    .pipe(mocha({reporter: 'spec', timeout: 5000}));
});

gulp.task('clean', function(cb) {
  del(['dist', 'build'], cb);
});

gulp.task('default', ['test', /* 'coverage', */ 'dist', 'declaration']);

gulp.task('reload', reload);

var printCoverageError = function (err) {
  if (err.message === 'Coverage failed') {
    var red = function (msg) {
      return '\u001b[91m' + msg + '\u001b[0m';
    };
    var colorizePercentage = function (pct) {
      if (pct < 100) {
        return red(pct + '%');
      }

      return pct + '%';
    };

    console.log(red('  \u00D7 Coverage did not pass the threshold (100%)'));

    var coverage = istanbul.summarizeCoverage();
    Object.keys(coverage).forEach(function (key) {
      if (!coverage[key].pct) {
        return;
      }
      console.log('    ' + key + ': ' + colorizePercentage(coverage[key].pct));
    });
  }
};

var remapCoverage = exports.remapCoverage = function () {
  return gulp.src('build/report/coverage-final.json')
    .pipe(remapIstanbul({
      reports: {
        'json': 'build/report/coverage-remapped.json',
        'html': 'build/report/lcov-ts-report'
      }
    }));
};

var coverage = function(cb) {
  gulp
    .src(['build/js/src/**/*.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      var cbCalled = false;
      gulp.src('build/js/test/**/*.js')
        .pipe(mocha({ reporter: 'dot', timeout: 5000 }))
        .on('error', function (err) {
          cbCalled = true;
          return cb(err);
        })
        .pipe(istanbul.writeReports({
          dir: 'build/report',
          reporters: [
            'lcov',
            'json'
          ],
          reportOpts: {
            dir: 'build/report',
            watermarks: {
              statements: [ 75, 100 ],
              lines: [ 75, 100 ],
              functions: [ 75, 100],
              branches: [ 75, 100 ]
            }
          }
        }))
        .pipe(istanbul.enforceThresholds({thresholds: {global: 100}}))
        .on('error', function (err) {
          printCoverageError(err);
          if (!cbCalled) {
            cbCalled = true;
            cb(err);
          }
        })
        .on('end', function () {
          remapCoverage();
          if (!cbCalled) {
            cb();
          }
        })
    });
}

gulp.task('coverage', ['compile'], coverage);

gulp.task('dev', function() {
  var bs = null;
  setWatching(function (error) {
    if (bs) {
      bs.notify(error, ONE_DAY);
    }
  });

  compile().on('end', function() {
    coverage(function(err) {
      var browserSync = require('browser-sync');
      bs = browserSync.create();
      bs.init({
        port: 1904,
        ui: { port: 3011 },
        ghostMode: false,
        server: 'build/report/lcov-ts-report',
        open: 'local'
      });
      if (err) {
        setTimeout(function(){
          bs.notify(err.message, ONE_DAY);
        }, 5000);
      }
      gulp.watch(['src/**/*.ts', 'test/**/*.ts', 'typings/**/*.ts'], function () {
        var abort = false;
        clearScreen();
        console.log('Building...');

        bs.notify('Building...', ONE_DAY);
        compile(true).on('error', function (error) {
          console.error('Build error');
          bs.notify('Build error', ONE_DAY);
          abort = true;
        }).on('finish', function () {
          if (abort) {
            return;
          }
          console.log('Build successful');
          console.log('Running tests and measuring coverage...');
          bs.notify('Running tests and measuring coverage...', ONE_DAY);
          coverage(function (err) {
            if (err) {
              bs.reload();
              setTimeout(function(){
                bs.notify(err.message, ONE_DAY);
              }, 2000);
            } else {
              bs.reload();
              setTimeout(function(){
                bs.notify("One HUNDRED percent!", ONE_DAY);
              }, 2000);
            }
            console.log('Coverage finished');
          });
        });
      });
    });
  });
});

gulp.task('commit', function () {
  process.argv = ['node', 'tsa', 'commit'];
  require('typescript-assistant/build/js/src/index');
});

gulp.task('assist', function () {
  process.argv = ['node', 'tsa'];
  require('typescript-assistant/build/js/src/index');
});