"use strict";

import yaml from "js-yaml";
import browser from "browser-sync";
import rimraf from "rimraf";
import fs from "fs";
import gulp from "gulp";
import mjmlGulp from "gulp-mjml";
import mjml from "mjml";
import nunjucks from "gulp-nunjucks-render";
import data from "gulp-data";
import imagemin from "gulp-imagemin";
import zip from "gulp-zip";

const PATHS = {
  src: "./src/{layouts,partials,templates}/**/*",
  mjml: {
    src: "./build/mjml/**/*.mjml",
    build: "./build/mjml/",
  },
  build: "./build/html/",
  data: "./src/data/data.yml",
  layouts: "./src/layouts/",
  partials: "./src/partials/",
  preview: "./src/preview/",
  images: "./src/templates/**/images/*",
  templates: "./src/templates/**/*.mjml",
  zip: "./build/html/"
};

let templatesList = [];

function loadData() {
  let file = fs.readFileSync(PATHS.data, "utf8");
  return yaml.load(file);
}

function getTemplates(done) {
  return fs.readdir(
    "./src/templates",
    { withFileTypes: true },
    (err, files) => {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }

      templatesList.length = 0;

      files.forEach((file) => {
        if (file.isDirectory()) {
          templatesList.push({
            title: file.name.split("_").join(" "),
            dirName: file.name,
          });
        }
      });

      done();
    }
  );
}

function clean(done) {
  rimraf("./build/*", done);
}

function buildPreview() {
  return gulp
    .src(`${PATHS.preview}index.html`)
    .pipe(
      nunjucks({
        data: {
          columns: 3, // TODO need to set this value into the preview
          templates: templatesList,
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
    .pipe(data(loadData))
    .pipe(
      nunjucks({
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
    .src(["./src/templates/**", "!./src/templates/**/*.mjml"])
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(PATHS.build));
}

function buildZip() {
  return fs.readdir(PATHS.build,
  (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      return createZip(file)
    });

    function createZip(dirName) {
      return gulp
        .src([`build/html/${dirName}/**`])
        .pipe(zip(`${dirName}.zip`))
        .pipe(gulp.dest(PATHS.build))
    }
  })
}

function setServer(done) {
  browser.init({
    server: {
      baseDir: PATHS.build,
      directory: false,
    },
    port: "9000",
    notify: false,
  });

  done();
}

function watchFiles() {
  gulp.watch([PATHS.src, PATHS.data], gulp.series("build")); // browser.reload
}

gulp.task(
  "build",
  gulp.series(
    clean,
    getTemplates,
    buildPreview,
    buildTemplates,
    buildTemplates,
    buildMJML,
    buildImages
  )
);

gulp.task(
  "zip",
  gulp.series(
    buildZip
  )
)

gulp.task(
  "default",
  gulp.series("build", "zip", setServer, gulp.parallel(watchFiles))
);
