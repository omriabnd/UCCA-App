
(function () {
  'use strict';

  angular.module('zAdmin.pages.profile')
      .service('profileService', ProfileService);

  /** @ngInject */
  function ProfileService(apiService) {
    var service = {
        UserProfile:[],
        getProfileData: function(user_id){
          return apiService.profile.getProfileData(user_id);
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
