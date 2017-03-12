
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.auth')
      .controller('authCtrl', authCtrl);

  /** @ngInject */
  function authCtrl($scope, $rootScope, $state, $filter, editableOptions, editableThemes, authService, storageService, PermissionsService,Core,$timeout) {
  	var vm = this;
    $rootScope.$hideSideBar = true;
    vm.loginDetails = {
      "password": null,
      "email":null
    };

  	vm.login = login;
    vm.forgotPassword = forgotPassword;

    function forgotPassword(){
      if(vm.loginDetails.email.$valid){
        var postEmail = {
          'email':vm.loginDetails.email.$viewValue
        }
        authService.forgotPassword(postEmail).then(resendPasswordSuccess,resendPasswordFailed)
      }
    }

    function resendPasswordSuccess(res){
      console.log("resend password success:", res.data.msg)
      Core.showNotification("success",res.data.msg)
    }

    function resendPasswordFailed(err){
      console.log("resend password error :", err)
    }

  	function login(){
      if( vm.loginDetails.$valid ) {
        $rootScope.$pageFinishedLoading = false;
        var postData =  {
          email    : vm.loginDetails.email.$viewValue,
          password : vm.loginDetails.password.$viewValue
        }
        authService.doLogin(postData).then(loginSuccess,loginFailed)
      }
  	}

    function loginSuccess(res){
      storageService.saveInLocalStorage('isLoggedIn',true);
      $rootScope.$connected = true;
      Core.user_role = res.profile.role;
      storageService.saveObjectInLocalStorage('user_role',Core.user_role);
      PermissionsService.setPermissions(res.profile.role.id).then(function(){
        $timeout(function(){$rootScope.$hideSideBar = false;}) 
        $state.go('layers');
      });
    }

    function loginFailed(err){
      console.log("login failed error :", err);
      // $rootScope.$connected = true;
    }


  }

})();
