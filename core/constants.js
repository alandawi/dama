'use strict';

import yargs from 'yargs';

const args = yargs.argv;

export const structureType = args.structureType;
export const folder = args.folder;

export const PATHS = {
    mjml: {
        src: './build/mjml/**/*.html',
        build: './build/mjml/',
    },
    build: './build/html/',
    layouts: `./src/layouts/`,
    partials: `./src/partials/`,
    preview: './src/preview/',
    images: './src/templates/**/images/*',
    templates: `./src/templates/${structureType}/**/*`,
    dataDamaShared: './src/data/dataDamaShared.json',
    dataDama: `./src/templates/${structureType}/**/dataDama.json`,
    zip: './build/html/',
};