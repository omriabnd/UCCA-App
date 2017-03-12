/**
 * Change top "Daily Downloads", "Active Users" values with animation effect
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('animatedChange', animatedChange);

  /** @ngInject */
  function animatedChange($timeout) {
    return {
      link: function (scope, element) {
        $timeout/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
          var newValue = element.attr('new-value');
          var oldvalue = parseInt(element.html());

          function changeValue(val) {
            $timeout/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
              element.html(val);
            }, 30);
          }

          if (newValue > oldvalue) {
            for (var i = oldvalue; i <= newValue; i++) {
              changeValue(i);
            }
          } else {
            for (var j = oldvalue; j >= newValue; j--) {
              changeValue(j);
            }
          }
          $timeout/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
            element.next().find('i').addClass('show-arr');
          }, 500);
        }, 3500);
      }
    };
  }

})();