
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.users')
      .controller('EditUsersCtrl', EditUsersCtrl);

  /** @ngInject */
  function EditUsersCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core, editUsersService, ENV_CONST) {
  	var vm = this;
  	vm.upsert = upsert;
    vm.back = back;
    Core.init(vm,EditTableStructure,editUsersService);

    // insertUserDataIntoStructure();
    vm.smartTableStructure.forEach(function(obj){
      obj.value = editUsersService.get(obj.key);
    });

    

  	function upsert(obj){
  	  console.log("edit",obj);

      var isValid = Core.validate(obj);
      if(isValid){
          editUsersService.saveUserDetails(obj).then(successUserCreation,failedUserCreation)
      }
  	}

    function back(){
        $state.go('users');
    }

    function successUserCreation(res){
        Core.showNotification('success',ENV_CONST.NOTIFICATIONS.USER_CREATED);
        $state.go('users');
    }

    function failedUserCreation(err){
        Core.showNotification('error',ENV_CONST.NOTIFICATIONS.GENERAL_ERROR);
    }
    
  }

})();
