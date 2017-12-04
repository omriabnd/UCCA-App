
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.auth')
      .service('authService', authService);

  /** @ngInject */
  function authService($rootScope,apiService) {
  	var service = {
        isLoggedIn: JSON.parse(apiService.isLoggedIn()),
        doLogin: function (loginDetails) {
          return apiService.login(loginDetails).then(function(res){return res.data});
        },
        logout: function(){
          return apiService.logout().then(function(res){
            $rootScope.$connected = false;
            return res
          },function(){
            $rootScope.$connected = false;
            return res
          });
        },
        forgotPassword: function(email){
          return apiService.forgotPassword(email);
        }
    }
    return service;
  }

})();
