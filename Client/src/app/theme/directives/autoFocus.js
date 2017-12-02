/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('autoFocus', autoFocus);

  /** @ngInject */
  function autoFocus($timeout, $parse) {
    return {
      link: function (scope, element, attrs) {
        var model = $parse(attrs.autoFocus);
        scope.$watch(model, function (value) {
          if (value === true) {
            $timeout(function(){
              element[0].focus();
              element[0].select();
            });
          }
        });
        element.bind('z', function () {
          scope.$apply(model.assign(scope, false));
        });
      }
    };
  }

})();