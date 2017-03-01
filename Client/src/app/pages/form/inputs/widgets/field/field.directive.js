/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
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
