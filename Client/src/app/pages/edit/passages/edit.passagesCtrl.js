
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages')
      .controller('EditPassagesCtrl', EditPassagesCtrl);

  /** @ngInject */
  function EditPassagesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editPassagesService, Core, ENV_CONST) {
  	var vm = this;
    vm.upsert = edit;
    vm.chooseText = chooseText;
    vm.chooseSource = chooseSource;
    vm.viewTasks = viewTasks;
    vm.viewProjects = viewProjects;
    vm.refreshData = refreshData;
    vm.back = back;
    Core.init(this,EditTableStructure,editPassagesService);

    vm.smartTableStructure.forEach(function(obj){
      obj.value = editPassagesService.get(obj.key);
      if(obj.key == 'type'){
        obj.value = ENV_CONST.PASSAGE_TYPE[obj.value]
      }
    });

    function back(){
      $state.go('passages');
    }

    function edit(obj){
      var postData = angular.copy(vm.smartTableStructure);
      var selectedSource = editPassagesService.Data.source
      postData.map(function(obj){
        if(obj.key == 'type'){
          obj.value = obj.value.label
        }
        else if(obj.key == 'source'){
          obj.value = selectedSource
        }
        return obj
      })
      editPassagesService.savePassageDataInDb(postData).then(function(){
        //Implement confirm / fail alert
        $state.go('passages');
      })
    }
    function chooseText(){
      console.log("chooseText");
      $state.go('edit.passages.texts')
    }
    function chooseSource(){
      console.log("chooseSource");
      $state.go('edit.passages.sources.manage')
    }
    function viewTasks(){
      console.log("viewTasks");
      $state.go('edit.passages.tasks')
    }
    function viewProjects(){
      console.log("viewProjects");
      $state.go('edit.passages.projects')
    }
    function refreshData(key){
      // set values from service
      vm.smartTableStructure.forEach(function(obj){
        key == obj.key ? obj.value = editPassagesService.get(obj.key) : "";
      })
    }
  }

})();
