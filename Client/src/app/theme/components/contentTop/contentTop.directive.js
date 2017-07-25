
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components')
      .directive('contentTop', contentTop);

  /** @ngInject */
  function contentTop($location, $state) {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/contentTop/contentTop.html',
      link: function($scope) {
        $scope.$watch(function () {
          var title = $state.current.title;
          if(!!$state.current.title && $state.current.title.indexOf('Edit') != -1){
            if(!!!$state.params.id){
              title = $state.current.title.replace('Edit','Add')
            }
          }
          $scope.activePageTitle = title;
        });
      }
    };
  }

})();