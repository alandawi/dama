'use strict';

import browser from 'browser-sync';
import rimraf from 'rimraf';
import fs, { watch } from 'fs';
import glob from 'glob';
import gulp from 'gulp';
import mjmlGulp from 'gulp-mjml';
import mjml from 'mjml';
import nunjucks from 'gulp-nunjucks-render';
import imagemin from 'gulp-imagemin';
import zip from 'gulp-zip';
import { PATHS, structureType } from './constants';

let templatesList = [];
let dataDama = {};

export function loadDataDama(done) {
    let shared = JSON.parse(fs.readFileSync(PATHS.dataDamaShared, 'utf8'));
    dataDama[shared.settings.id] = shared.content;

    glob(PATHS.dataDama , function (err, res) {
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

export function getTemplates(done) {
    return fs.readdir(
        `./src/templates/${structureType}`,
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

export function cleanBuild(done) {
    rimraf('./build/*', done);
}

export function buildPreview() {
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

export function buildTemplates() {
    let destinationFolder = PATHS.mjml.build;
    let extType = 'mjml';

    if (structureType == 'standard') {
        destinationFolder = PATHS.build;
        extType = 'html';
    }

    return gulp
        .src(`./src/templates/${structureType}/**/*.${extType}`)
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
        .pipe(gulp.dest(destinationFolder));
}

export function buildMJML() {
    return gulp
        .src(PATHS.mjml.src)
        .pipe(mjmlGulp(mjml, { beautify: true, minify: false }))
        .pipe(gulp.dest(PATHS.build));
}

export function buildImages() {
    return gulp
        .src([
        `./src/templates/${structureType}/**/*.jpg`,
        `./src/templates/${structureType}/**/*.jpeg`,
        `./src/templates/${structureType}/**/*.png`,
        '!./src/templates/**/*.html',
        '!./src/templates/**/*.mjml',
        '!./src/templates/**/*.json'
        ])
        .pipe(
        imagemin([
            imagemin.mozjpeg({ quality: 80, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
            plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
            }),
        ])
        )
        .pipe(gulp.dest(PATHS.build));
}

export function buildZip(done) {
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

export function setServer(done) {
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

export function watchFiles() {
    //gulp.watch([PATHS.design, PATHS.templates, PATHS.dataDamaShared], gulp.series((structureType == 'standard') ? 'devStandard' : 'devResponsive')); // browser.reload
    gulp.watch([PATHS.design, PATHS.templates, PATHS.dataDamaShared], gulp.series((structureType == 'standard') ? 'devStandard' : 'devResponsive')).on("change", browser.reload);
}

