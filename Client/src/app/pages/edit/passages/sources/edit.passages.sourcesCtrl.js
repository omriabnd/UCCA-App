
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages.sources')
      .controller('EditPassagesSourcesCtrl', EditPassagesSourcesCtrl);

  /** @ngInject */
  function EditPassagesSourcesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editPassagesService, editPassageSourcesService, Core, TableData) {
  	var vm = this;
    vm.edit = edit;
    vm.editRow = editRow;
    vm.chooseRow = chooseRow;
    vm.newSource = newSource;
    
    var parentCtrl = $scope.$parent.vm;
    
    vm.smartTableData = TableData;
    Core.init(this,EditTableStructure,editPassageSourcesService);

    function newSource (obj,index){
      console.log("editRow",obj);
      $state.go('edit.passages.sources.create',{from:'passages'})
      // $state.go('edit.passages.texts',{})
    }

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.sources')
    }

    function chooseRow(obj,index){
      console.log("chooseRow "+index,obj);
      var sourceDetails = {
        "id":obj.id,
        "name":obj.name
      }
      editPassagesService.set("source",sourceDetails);
      parentCtrl.refreshData("source");
    }

  	function edit(obj){
  	  console.log("edit",obj);
  	}
  }

})();
