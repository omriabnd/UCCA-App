
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit')
      .controller('EditCtrl', EditCtrl);

  /** @ngInject */
  function EditCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal) {
  	var vm = this;
  	vm.back = back;
    vm.addNewAssetMode = !!!$state.params.id;
    vm.editAssetMode = !!$state.params.id;
    
    function back(){
      history.back();
    }

  }

})();