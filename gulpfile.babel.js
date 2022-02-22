'use strict';

import browser from 'browser-sync';
import rimraf from 'rimraf';
import fs from 'fs';
import glob from 'glob';
import gulp from 'gulp';
import mjmlGulp from 'gulp-mjml';
import mjml from 'mjml';
import nunjucks from 'gulp-nunjucks-render';
import imagemin from 'gulp-imagemin';
import zip from 'gulp-zip';

const PATHS = {
  src: './src/{layouts,partials,templates}/**/*',
  mjml: {
    src: './build/mjml/**/*.mjml',
    build: './build/mjml/',
  },
  build: './build/html/',
  data: './src/data/data.yml',
  layouts: './src/layouts/',
  partials: './src/partials/',
  preview: './src/preview/',
  images: './src/templates/**/images/*',
  templates: './src/templates/**/*.mjml',
  dataDamaShared: './src/data/dataDamaShared.json',
  dataDamas: './src/templates/**/dataDama.json',
  zip: './build/html/',
};

let templatesList = [];
let dataDama = {};

function loadDataDama(done) {
  // Shared
  let shared = JSON.parse(fs.readFileSync(PATHS.dataDamaShared, 'utf8'));
  dataDama[shared.settings.id] = shared.content;

  // Units
  glob(PATHS.dataDamas , function (err, res) {
    if (err) {
      console.error('Error loadDataDama: ', err);
    } else {
      res.forEach((file) => {
        const dataDamaFile = JSON.parse(fs.readFileSync(file, 'utf8'));
        dataDama[dataDamaFile.settings.id] = dataDamaFile.content;
      });
    }
  });

  done();
}

function getTemplates(done) {
  return fs.readdir(
    './src/templates',
    { withFileTypes: true },
    (err, files) => {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }

      templatesList.length = 0;

      files.forEach((file) => {
        if (file.isDirectory()) {
          templatesList.push({
            title: file.name.split('_').join(' '),
            dirName: file.name,
          });
        }
      });

      done();
    }
  );
}

function clean(done) {
  rimraf('./build/*', done);
}

function buildPreview() {
  return gulp
    .src(`${PATHS.preview}index.html`)
    .pipe(
      nunjucks({
        data: {
          templates: templatesList
        },
        envOptions: {
          noCache: true,
        },
        inheritExtension: true,
      })
    )
    .pipe(gulp.dest(PATHS.build));
}

function buildTemplates() {
  return gulp
    .src(PATHS.templates)
    .pipe(
      nunjucks({
        data: dataDama,
        path: [PATHS.layouts, PATHS.partials],
        envOptions: {
          noCache: true,
        },
        inheritExtension: true,
      })
    )
    .pipe(gulp.dest(PATHS.mjml.build));
}

function buildMJML() {
  return gulp
    .src(PATHS.mjml.src)
    .pipe(mjmlGulp(mjml, { beautify: true, minify: false }))
    .pipe(gulp.dest(PATHS.build));
}

function buildImages() {
  return gulp
    .src(['./src/templates/**', '!./src/templates/**/*.mjml', '!./src/templates/**/*.json'])
    .pipe(
      imagemin([
        //imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(PATHS.build));
}

function buildZip(done) {
  return fs.readdir(PATHS.build, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      return createZip(file);
    });

    function createZip(dirName) {
      return gulp
        .src([`build/html/${dirName}/**`])
        .pipe(zip(`${dirName}.zip`))
        .pipe(gulp.dest(PATHS.build));
    }

    done();
  });
}

function setServer(done) {
  browser.init({
    server: {
      baseDir: PATHS.build,
      directory: false,
    },
    port: '9000',
    notify: false,
  });

  done();
}

function watchFiles() {
  gulp.watch([PATHS.src, PATHS.data], gulp.series('build')); // browser.reload
}

gulp.task(
  'build',
  gulp.series(
    clean,
    loadDataDama,
    getTemplates,
    buildPreview,
    buildTemplates,
    buildMJML,
    buildImages
  )
);

gulp.task('zip', buildZip);

gulp.task(
  'default',
  gulp.series('build', setServer, gulp.parallel(watchFiles))
);
