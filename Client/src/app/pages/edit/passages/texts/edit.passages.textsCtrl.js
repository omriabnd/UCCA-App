
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.passages.texts')
      .controller('EditPassagesTextsCtrl', EditPassagesTextsCtrl);

  /** @ngInject */
  function EditPassagesTextsCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editPassagesTextService, Core, editPassagesService) {
  	var vm = this;
    vm.edit = edit;
    vm.readTextFromFile = readTextFromFile;

    var parentCtrl = $scope.$parent.vm;

    function edit(obj){
  	  console.log("edit",obj);
      vm.textFrom == 'Input' ? editPassagesService.set("text",vm.text) : editPassagesService.set("text",vm.textFromFile);
      parentCtrl.refreshData("text");
  	}

    function readTextFromFile(event){
      var input = event;

      var reader = new FileReader();
      reader.onload = function(){
        vm.textFromFile = reader.result;
      };
      reader.readAsText(input.files[0]);
    }
  }

})();
