'use strict';

import yargs from 'yargs';

const args = yargs.argv;

export const structureType = args.structureType;
export const env = args.env;
export const folder = args.folder;

export const PATHS = {
    mjml: {
        src: './build/mjml/**/*.html',
        build: './build/mjml/',
    },
    build: './build/html/',
    utils: `./src/utils/`,
    layouts: `./src/layouts/`,
    partials: `./src/partials/`,
    preview: './src/preview/',
    images: './src/templates/**/images/*',
    templates: `./src/templates/${structureType}/**/*`,
    dataDamaShared: './src/data/dataDamaShared.json',
    dataDama: `./src/templates/${structureType}/**/dataDama.json`,
    zip: './build/html/',
};