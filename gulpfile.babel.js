'use strict';

import yaml from 'js-yaml';
import browser from 'browser-sync';
import rimraf from 'rimraf';
import fs from 'fs';
import gulp from 'gulp';
import mjmlGulp from 'gulp-mjml';
import mjml from 'mjml';
import nunjucks from 'gulp-nunjucks-render';
import data from 'gulp-data';

const PATHS = {
  src: './src/{layouts,partials,templates}/**/*.mjml',
  mjml: {
    src: './build/mjml/**/*.mjml',
    build: './build/mjml/',
  },
  build: './build/html/',
  data: './src/data/data.yml',
  layouts: './src/layouts/',
  partials: './src/partials/',
  images: './src/templates/**/images/*',
  templates: './src/templates/**/*.mjml'
}

function loadData() {
  let file = fs.readFileSync(PATHS.data, 'utf8')
  return yaml.load(file);
}

function clean(done) {
  rimraf('./build/*', done);
}

function buildTemplates() {
  return gulp.src(PATHS.templates)
    .pipe(data(loadData))
    .pipe(nunjucks({
      path: [
        PATHS.layouts,
        PATHS.partials
      ],
      envOptions: {
        noCache: true
      },
      inheritExtension: true
    }))
    .pipe(gulp.dest(PATHS.mjml.build));
}

function buildMJML() {
  const options = {
    beautify: true,
    minify: false
  };

  return gulp.src(PATHS.mjml.src)
    .pipe(mjmlGulp(mjml, options))
    .pipe(gulp.dest(PATHS.build));
}

function buildImages(done) {
  return gulp.src(['./src/templates/**', '!./src/templates/**/*.mjml'])
    .pipe(gulp.dest(PATHS.build));
}

function setServer(done) {
  const options = {
    server: {
      baseDir: PATHS.build,
      directory: true
    },
    port: '9000',
    notify: false
  };

  browser.init(options);
  done();
}

function watchFiles() {
  gulp.watch(PATHS.data).on('all', gulp.series(buildTemplates, buildMJML, buildImages, browser.reload));
  gulp.watch(PATHS.images).on('all', gulp.series(buildTemplates, buildMJML, buildImages, browser.reload));
  gulp.watch(PATHS.src).on('all', gulp.series(buildTemplates, buildMJML, buildImages, browser.reload));
}

gulp.task('build',
  gulp.series(clean, buildTemplates, buildMJML, buildImages));

gulp.task('default',
  gulp.series('build', gulp.parallel(setServer, watchFiles)));