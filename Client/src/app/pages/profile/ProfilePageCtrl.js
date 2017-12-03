
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.profile')
    .controller('ProfilePageCtrl', ProfilePageCtrl);

  /** @ngInject */
  function ProfilePageCtrl($scope, fileReader, $filter, $uibModal, profileService, Profile, Core) {
    var vm = this;
    vm.profileDetails = Profile;
    vm.passwordDetails = {
      // old_password: null,
      new_password:'',
      new_password_again:''
    };

    vm.saveProfileData = saveProfileData;
    vm.updatePassword = updatePassword;
    vm.cancle = cancle;
    vm.arePersonalInfoPasswordsEqual = arePersonalInfoPasswordsEqual;



    function arePersonalInfoPasswordsEqual () {
      return !!vm.passwordDetails.new_password_again && vm.passwordDetails.new_password == vm.passwordDetails.new_password_again;
    };

    function cancle(){
      // window.history.back();
    }

    function saveProfileData(){
      profileService.saveProfileData(vm.profileDetails).then(saveProfileSuccess,saveProfileFailed)
    }

    function updatePassword(){
      vm.newPassEquals = vm.arePersonalInfoPasswordsEqual()
      if(vm.passwordDetails.$valid && vm.newPassEquals ){
        var newPasswordDetails = vm.passwordDetails;
        var postPasswords = {
          "new_password1":vm.passwordDetails.new_password, 
          "new_password2":vm.passwordDetails.new_password_again
        }
        profileService.updatePassword(postPasswords).then(savePasswordSuccess,saveProfileFailed)
      }

    }

    function savePasswordSuccess(res){
      Core.showNotification('success','Update Success')
    }
    function saveProfileSuccess(res){
      vm.profileDetails = res.data;
      Core.showNotification('success','Update Success')
    }

    function saveProfileFailed(err){
      console.log("saveFailed", err);
    }
  }

})();
