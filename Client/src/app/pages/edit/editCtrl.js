
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit')
      .controller('EditCtrl', EditCtrl);

  /** @ngInject */
  function EditCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal) {
  	var vm = this;
  	vm.back = back;

    function back(){
      history.back();
    }

  }

})();