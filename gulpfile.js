const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const atImport = require('postcss-import');
const cssnano = require('cssnano');
const browserSync = require('browser-sync');
const del = require('del');
const argv = require('yargs').argv;
const execFile = require('child_process').execFile;
const hugo = require('hugo-bin');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

const dirs = {
  src: 'src',
  dist: 'dist'
};

const uploadsDir = 'content/**/*.{jpg,png,jpeg}';

function runHugo(done) {
  execFile(hugo, ['--destination', dirs.dist, '--ignoreCache'], (err, stdout) => {
    if (err) {
      throw err;
    }
    done();
  });
}

function clean() {
  return del([dirs.dist]);
}

function images() {
  return gulp.src([`${dirs.src}/img/*`, uploadsDir, 'static/img/*'])
    .pipe(imagemin())
    .pipe(gulp.dest(`${dirs.dist}/img`));
}

function styles() {
  const plugins = [
    atImport(),
    postcssPresetEnv({
      stage: 0
    })
  ];

  if (argv.deploy) {
    plugins.push(cssnano());
  }

  return gulp.src(`${dirs.src}/css/*.css`)
    .pipe(postcss(plugins))
    .pipe(gulp.dest(`${dirs.dist}/css`));
}

function scripts() {
  const b = browserify({
    debug: !argv.deploy,
    entries: `${dirs.src}/js/main.js`,
    paths: [`${dirs.src}/js`]
  });

  return b.transform(babelify, {
      presets: ['@babel/preset-env']
    })
    .bundle()
    .pipe(source(`main.js`))
    .pipe(buffer())
    .on('error', (err) => console.log(err))
    .pipe(gulp.dest(`${dirs.dist}/js`));
}

function serve() {
  const bs = browserSync.create();

  function reload(done) {
    bs.reload();
    done();
  }

  bs.init({
    notify: false,
    server: {
      baseDir: [dirs.dist, dirs.src],
      listing: true
    }
  });

  gulp.watch(['{content,layouts,static}/**/*'], gulp.series(runHugo, reload));
  gulp.watch([`${dirs.src}/css/**/*.css`], gulp.series(styles, reload));
  gulp.watch([`${dirs.src}/js/**/*.js`], gulp.series(scripts, reload));
}

gulp.task('build', gulp.series(clean, gulp.parallel(runHugo, images, styles, scripts)));

gulp.task('serve', serve);

gulp.task('hugo', runHugo);
gulp.task('scripts', scripts);
gulp.task('styles', styles);
gulp.task('images', images);
