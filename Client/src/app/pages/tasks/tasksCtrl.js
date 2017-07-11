
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.tasks')
      .controller('tasksCtrl', tasksCtrl);

  /** @ngInject */
  function tasksCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, tasksService, TableStructure, Core, TableData, $timeout) {

    var vm = this;
    vm.searchTable = $state.current.name;

    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,tasksService);
    vm.smartTableCanUseAction = smartTableCanUseAction;
    vm.editRow = editRow;
    vm.previewTask = Core.previewTask;

    $timeout(function(){
        $rootScope.$hideSideBar = false;
    })


    function smartTableCanUseAction(functionName,onlyForRoles,objType,onlyForTypes,statusPerms){
      /*
        logic wehn to show the button
      */
      var permitted = true
      if(!!onlyForRoles && onlyForRoles.length){
        permitted = (onlyForRoles.indexOf(Core.user_role.name.toUpperCase()) > -1)
      }
      if(permitted && !!statusPerms && !!statusPerms.accepteds && !!statusPerms.accepteds.length){
        permitted = (statusPerms.accepteds.indexOf(statusPerms.status) > -1)
      }

      return permitted;
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.tasks',{id:obj.id})
    }

  }

})();
