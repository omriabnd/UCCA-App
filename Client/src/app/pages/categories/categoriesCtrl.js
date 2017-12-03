
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.categories')
      .controller('categoriesCtrl', categoriesCtrl);

  /** @ngInject */
  function categoriesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, categoriesService, TableStructure, Core, TableData) {

    var vm = this;
    vm.searchTable = $state.current.name;

    vm.smartTableData = TableData;
    Core.init(vm,TableStructure,categoriesService);

    vm.editRow = editRow;

    function editRow (obj,index){
      console.log("editRow",obj);
      $state.go('edit.categories',{id:obj.id})
    }

  }

})();
