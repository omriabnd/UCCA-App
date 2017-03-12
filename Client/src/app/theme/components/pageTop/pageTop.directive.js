
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
      controllerAs:"vm",
      controller:pageTopCtrl
    };
  }
  
  /** @ngInject */
  function pageTopCtrl(authService,$state) {
    var vm = this;
    this.logout = function(){
      authService.logout().then(function(data){
        $state.go('auth');
      },function(data){
        $state.go('auth');
      })
    } 
  }

})();