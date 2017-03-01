
(function () {
  'use strict';

  angular.module('zAdmin.pages.users')
      .controller('UsersCtrl', UsersCtrl);

  /** @ngInject */
  function UsersCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, usersService, TableStructure, Core,TableData) {

  	var vm = this;
    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,usersService);

    vm.editRow = editRow;

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.users',{id:obj.id})
    }


  }

})();
