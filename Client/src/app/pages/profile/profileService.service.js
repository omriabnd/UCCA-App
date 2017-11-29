
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.profile')
      .service('profileService', ProfileService);

  /** @ngInject */
  function ProfileService(apiService) {
    var service = {
        UserProfile:[],
        getProfileData: function(){
          return apiService.profile.getProfileData();
        },
        saveProfileData: function(profileDetails){
          return apiService.profile.putProfileData(profileDetails);
        },
        updatePassword: function(passwordDetails){
          return apiService.profile.postUserPassword(passwordDetails);
        }

    }
    return service;
  }

})();
