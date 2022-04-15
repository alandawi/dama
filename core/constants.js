'use strict';

import yargs from 'yargs';

const args = yargs.argv;

export const structureType = args.structureType;

export const PATHS = {
    design: `./src/design/${structureType}/{layouts,partials}/*`,
    mjml: {
        src: './build/mjml/**/*.mjml',
        build: './build/mjml/',
    },
    build: './build/html/',
    layouts: `./src/design/${structureType}/layouts/`,
    partials: `./src/design/${structureType}/partials/`,
    preview: './src/preview/',
    images: './src/templates/**/images/*',
    templates: `./src/templates/${structureType}/**/*`,
    dataDamaShared: './src/data/dataDamaShared.json',
    dataDama: './src/templates/**/dataDama.json',
    zip: './build/html/',
};