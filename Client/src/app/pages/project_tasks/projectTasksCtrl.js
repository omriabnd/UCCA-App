
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

    vm.editRow = editRow;
    vm.previewTask = previewTask;
    vm.projectId = $state.params.id;

    vm.projectLayerType = !!$state.params.layerType && ($state.params.layerType.toUpperCase() == ENV_CONST.LAYER_TYPE.ROOT);

    function previewTask (obj,index){
      console.log("previewTask",obj);
      // $state.go('tokenizationPage',{})
      switch(obj.type){
        case 'TOKENIZATION':
          openInNewTab('#/tokenizationPage/'+obj.id)
          break;
        default:
          openInNewTab('#/annotationPage/'+obj.id)
          break;
      }
    }
    
    function openInNewTab(url) {
      var win = window.open(url, '_blank');
      win.focus();
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      if(obj.id){

      }else{
        $state.go('edit.tasks.tokenization',{projectLayerType:ENV_CONST.LAYER_TYPE.ROOT})
      }

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
