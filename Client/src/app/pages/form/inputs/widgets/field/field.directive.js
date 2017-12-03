
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.form')
      .directive('field', fieldDirective);

  /** @ngInject */
  function fieldDirective($timeout) {
    return {
      restrict: 'E',
      replace: true,
      remove:true,
      transclude: true,
      templateUrl:'app/pages/form/inputs/widgets/field/field.html',
      link: function(scope,element,attr){

      }
    };
  }
})();
