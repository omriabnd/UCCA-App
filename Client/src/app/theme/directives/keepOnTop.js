
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