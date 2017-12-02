
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('keepOnTop', keepOnTop);

  /** @ngInject */
  function keepOnTop() {
    return {
      link: function (scope,elem,attr) {
        $(window).on('scroll', function() {
          var scrollTop = $(window).scrollTop();
          $(elem).css('marginTop',scrollTop+'px')
        });
      }
    };
  }

})();