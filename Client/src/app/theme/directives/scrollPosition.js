/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('scrollPosition', scrollPosition);

  /** @ngInject */
  function scrollPosition() {
    return {
      scope: {
        scrollPosition: '=',
        maxHeight: '='
      },
      link: function (scope) {
        $(window).on('scroll', function() {
          var scrollTop = $(window).scrollTop() > scope.maxHeight;
          if (scrollTop !== scope.prevScrollTop) {
            scope.$apply(function() {
              scope.scrollPosition = scrollTop;
            });
          }
          scope.prevScrollTop = scrollTop;
        });
      }
    };
  }

})();