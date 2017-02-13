
(function () {
  'use strict';

  angular.module('zAdmin.pages.tasks')
      .controller('tasksCtrl', tasksCtrl);

  /** @ngInject */
  function tasksCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, tasksService, TableStructure, Core, TableData) {

    var vm = this;
    vm.searchTable = $state.current.name;

    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,tasksService);
    vm.smartTableCanUseAction = smartTableCanUseAction;
    vm.editRow = editRow;

    function smartTableCanUseAction(functionName,type){
      /*
        logic wehn to show the button
      */
      console.log(functionName +' '+ type);
      return true;
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.tasks',{id:obj.id})
    }

  }

})();
