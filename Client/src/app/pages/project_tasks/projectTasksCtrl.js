
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
    // vm.createNewTask = createNewTask;
    vm.createNewAnnotatoinTask = createNewAnnotatoinTask;
    vm.createNewReviewTask = createNewReviewTask;
    Core.init(vm,TableStructure,projectTasksService);
    vm.smartTableCanUseAction = smartTableCanUseAction;

    vm.editRow = editRow;
    vm.previewTask = Core.previewTask;
    vm.projectId = $state.params.id;

    vm.projectRootLayerType = !!$state.params.layerType && ($state.params.layerType.toUpperCase() == ENV_CONST.LAYER_TYPE.ROOT);
    vm.projectDerivedLayerType = !!$state.params.layerType && ($state.params.layerType.toUpperCase() != ENV_CONST.LAYER_TYPE.ROOT);

    
    vm.smartTableStructure.forEach(function(obj){
      if(obj.key=='project'){
        obj.value = $state.params.id;
      }
    })
    
    function editRow (obj,index){
      console.log("editRow",obj);
      if(obj.id){
        $state.go('edit.tasks.'+obj.type.toLowerCase(),{
          id:obj.id,
          projectLayerType:$state.params.layerType.toUpperCase(),
          projectId:$state.params.id,
          parentTaskId:obj.id
        })
      }else{
        // its the top bottun of "create tokenization/annotation task". tableRow must have an id...
        // $state.go('edit.tasks.tokenization',{
        $state.go('edit.tasks.'+(vm.projectRootLayerType ? 'tokenization' : 'annotation'),{
          projectLayerType:$state.params.layerType.toUpperCase(),
          projectId:$state.params.id,
        })
      }

    }

    function smartTableCanUseAction(functionName,onlyForRoles,objType,onlyForTypes,statusPerms){
      /*
        logic wehn to show the button
      */
      var permitted = true;
      if(!!onlyForRoles && onlyForRoles.length){
        permitted = (onlyForRoles.indexOf(Core.user_role.name.toUpperCase()) > -1)
      }
      if(permitted && !!onlyForTypes && onlyForTypes.length && !!objType){
        permitted = (onlyForTypes.indexOf(objType) > -1)
      }
      if(permitted && !!statusPerms && !!statusPerms.accepteds && !!statusPerms.accepteds.length){
        permitted = (statusPerms.accepteds.indexOf(statusPerms.status) > -1)
      }
      return permitted;
    }

    function createNewAnnotatoinTask(obj,index){
      $state.go('edit.tasks.annotation',{
        projectLayerType:$state.params.layerType.toUpperCase(),
        projectId:$state.params.id,
        parentTaskId:obj.id
      })
    }

    function createNewReviewTask(obj,index){
      $state.go('edit.tasks.review',{
        projectLayerType:$state.params.layerType.toUpperCase(),
        projectId:$state.params.id,
        parentTaskId:obj.id
      })
    }



  }

})();
