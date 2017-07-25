/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('zoomIn', zoomIn);

  /** @ngInject */
  function zoomIn($timeout, $rootScope) {
    return {
      restrict: 'A',
      link: function ($scope, elem) {
        var delay = 1000;

        if ($rootScope.$pageFinishedLoading) {
          delay = 100;
        }

        $timeout(function(){
          elem.removeClass('full-invisible');
          elem.addClass('animated zoomIn');
        }, delay);
      }
    };
  }

})();