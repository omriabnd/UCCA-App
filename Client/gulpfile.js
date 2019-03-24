'use strict';

var gulp = require('gulp');
var wrench = require('wrench');

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
/*wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
}); */

/*
 * Gulp 4 requires loading files in order, as there are no forward references
 */
require('./gulp/images');
require('./gulp/styles');
require('./gulp/scripts');
require('./gulp/inject');
require('./gulp/build');
require('./gulp/watch');
require('./gulp/server');


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', gulp.series('clean', function () {
  gulp.start('build');
}));
