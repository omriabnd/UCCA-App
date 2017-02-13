
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
