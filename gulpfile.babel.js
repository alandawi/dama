'use strict';

import { 
  cleanBuild,
  loadDataDama,
  getTemplates,
  buildPreview,
  buildTemplates,
  buildImages,
  setServer,
  watchFiles,
  buildMJML,
  buildZip,
  sendEmail
} from './core/functions';
import gulp from 'gulp';

// Core
gulp.task(
  'core',
  gulp.series(
    cleanBuild,
    loadDataDama,
    getTemplates,
    buildPreview,
    buildTemplates,
  )
);

// Standard (without mjml)
gulp.task(
  'devStandard',
  gulp.series(
    'core',
    buildImages,
    setServer,
    gulp.parallel(watchFiles)
  )
);

gulp.task(
  'buildStandard',
  gulp.series(
    'core',
    buildImages
  )
);

// Responsive (with mjml)
gulp.task(
  'devResponsive',
  gulp.series(
    'core',
    buildMJML,
    buildImages,
    setServer,
    gulp.parallel(watchFiles)
  )
);

gulp.task(
  'buildResponsive',
  gulp.series(
    'core',
    buildMJML,
    buildImages
  )
);

// Zip
gulp.task('zip', buildZip);

// SendEmail
gulp.task('sendEmail', sendEmail);