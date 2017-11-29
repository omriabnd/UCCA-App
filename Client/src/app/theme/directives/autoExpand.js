/**
 * Auto expand textarea field
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('autoExpand', autoExpand);

  /** @ngInject */
  function autoExpand() {
    return {
      restrict: 'A',
      link: function ($scope, elem) {
        elem.bind('keydown', function ($event) {
          var element = $event.target;
          $(element).height(0);
          var height = $(element)[0].scrollHeight;
          height = (height < 16) ? 16 : height;
          $(element).height(height);
        });

        // Expand the textarea as soon as it is added to the DOM
        setTimeout/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
          var element = elem;
          $(element).height(0);
          var height = $(element)[0].scrollHeight;
          height = (height < 16) ? 16 : height;
          $(element).height(height);
        }, 0)
      }
    };
  }

})();