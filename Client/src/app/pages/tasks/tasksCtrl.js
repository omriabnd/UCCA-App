
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
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
    vm.previewTask = Core.previewTask;
    
    function smartTableCanUseAction(functionName,onlyForRoles,type){
      /*
        logic wehn to show the button
      */
      if(!!onlyForRoles && onlyForRoles.length){
        return (onlyForRoles.indexOf(Core.user_role.name.toUpperCase()) > -1)
      }
      return true;
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.tasks',{id:obj.id})
    }

  }

})();
