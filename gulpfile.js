var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var wiredep = require('wiredep').stream;
var inject = require("gulp-inject");

var paths = {
  sass: ['./scss/**/*.scss'],
  clientJS: ['./www/config.js', './www/application.js', './www/modules/**/*.js'],
  vendorJS: ['./www/lib/**/*.js'],
  clientCss: ['./www/modules/**/*.css'],
  vendorCss: ['./www/lib/**/*.css'],
  views: ['./www/modules/**/*.html']
};

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('wiredep', function () {
  gulp.src('./www/index.html')
    .pipe(wiredep({
      fileTypes: {
        html: {
          replace: {
            js: function(filePath) {
              return '<script src="' + filePath + '"></script>';
            },
            css: function(filePath) {
              console.log(filePath);
              return '<link rel="stylesheet" href="' + filePath + '"/>';
            }
          }
        }
      },
      // Ignore everything that is contained within ionic.bundle.js
      exclude: [/angular/,
      /angular-animate/,
      /angular-sanitize/,
      /angular-ui-router/,
      /ionic-angular/,
      /collide/,
      /ionic.js/]
    }))
    .pipe(gulp.dest('./www/'));
});

gulp.task('injector', function () {
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(paths.clientJS.concat(paths.clientCss), {read: false});

  gulp.src('./www/index.html')
  .pipe(inject(sources, {
    ignorePath: 'www/'
  }))
    .pipe(gulp.dest('./www'));
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('dependencies', ['wiredep', 'injector']);

gulp.task('default', ['sass', 'dependencies']);
