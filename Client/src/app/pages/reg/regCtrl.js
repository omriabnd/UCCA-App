
(function () {
  'use strict';

  angular.module('zAdmin.pages.reg')
      .controller('regCtrl', regCtrl);

  /** @ngInject */
  function regCtrl($scope, $rootScope, $state, $filter, editableOptions, editableThemes, regService, storageService) {
  	var vm = this;
    vm.GuestUserDetailes = {};
  	vm.register = register;

  	function register(){
      regService.registerNewUser(vm.GuestUserDetailes).then(registerSuccess,resterFailed)
  	}

    function registerSuccess(res){
      $state.go('auth');
    }

    function resterFailed(err){
      console.log("register failed error :", err)
    }
  }

})();
