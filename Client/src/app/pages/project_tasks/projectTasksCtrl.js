
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.projectTasks')
      .controller('projectTasksCtrl', projectTasksCtrl);

  /** @ngInject */
  function projectTasksCtrl($scope, $state, projectTasksService, TableStructure, Core, TableData, ENV_CONST) {

    var vm = this;
    vm.searchTable = $state.current.name;
    vm.smartTableData = TableData;
    vm.createNewTask = createNewTask;
    Core.init(vm,TableStructure,projectTasksService);
    vm.smartTableCanUseAction = smartTableCanUseAction;

    vm.editRow = editRow;
    vm.previewTask = Core.previewTask;
    vm.projectId = $state.params.id;

    vm.projectLayerType = !!$state.params.layerType && ($state.params.layerType.toUpperCase() == ENV_CONST.LAYER_TYPE.ROOT);

    function editRow (obj,index){
      console.log("editRow",obj);
      if(obj.id){

      }else{
        $state.go('edit.tasks.tokenization',{projectLayerType:ENV_CONST.LAYER_TYPE.ROOT})
      }

    }

    function smartTableCanUseAction(functionName,onlyForRoles,type){
      /*
        logic wehn to show the button
      */
      if(!!onlyForRoles && onlyForRoles.length){
        return (onlyForRoles.indexOf(Core.user_role.name.toUpperCase()) > -1)
      }
      return true;
    }

    function createNewTask(obj,index){
      switch($state.params.layerType){
        case ENV_CONST.LAYER_TYPE.ROOT:{
          $state.go('edit.tasks',{type:obj.type,projectLayerType:ENV_CONST.LAYER_TYPE.ROOT});
          break;
        }
        default:{
          $state.go('edit.tasks',{type:obj.type});
          break;
        }
      }
    }

  }

})();
