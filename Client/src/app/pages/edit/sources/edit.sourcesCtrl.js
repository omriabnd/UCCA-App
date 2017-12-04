
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.sources')
      .controller('EditSourcesCtrl', EditSourcesCtrl);

  /** @ngInject */
  function EditSourcesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core,editSourcesService) {
  	var vm = this;
  	vm.upsert = upsert;
    vm.back = back;
    Core.init(this,EditTableStructure,editSourcesService);

    vm.smartTableStructure.forEach(function(obj){
      obj.value = editSourcesService.get(obj.key);
    })

  	function upsert(obj){
      console.log("edit",obj);
      editSourcesService.saveSourceDetails(obj).then(function(response){
        if($state.params.from && $state.params.from == 'passages'){
          $state.go("edit.passages")
        }else{
          $state.go("sources")
        }
      })
    }

    function back(){
      $state.go('sources');
    }
  }

})();
