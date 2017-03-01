
(function () {
  'use strict';

  angular.module('zAdmin.pages.passages')
      .controller('PassagesCtrl', PassagesCtrl);

  /** @ngInject */
  function PassagesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, passagesService, TableStructure, Core,TableData) {
  	
      var vm = this;
      vm.smartTableData = TableData;
      Core.init(vm,TableStructure,passagesService);

      vm.editRow = editRow;

      function editRow (obj,index){
        console.log("editRow",obj);
        $state.go('edit.passages',{id:obj.id})
      }

  }

})();
