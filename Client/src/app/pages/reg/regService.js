
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.reg')
      .service('regService', regService);

  /** @ngInject */
  function regService(apiService) {
  	var service = {
        registerNewUser: function(newUserDetails){
          return apiService.registerNewUser(newUserDetails);
        }
    }
    return service;
  }

})();
