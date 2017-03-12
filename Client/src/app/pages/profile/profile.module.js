
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.profile', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('profile', {
          url: '/profile',
          title: 'Edit Profile',
          templateUrl: 'app/pages/profile/profile.html',
          controller: 'ProfilePageCtrl',
          controllerAs:'vm',
          resolve:{
            Profile: function(profileService){
              var user_id = "1";
              return profileService.getProfileData(user_id).then(function(res){
                  return res.data
              });
            }
          }
        });
  }

})();
