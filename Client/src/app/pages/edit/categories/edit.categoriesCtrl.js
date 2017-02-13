
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.categories')
      .controller('EditCategoriesCtrl', EditCategoriesCtrl);

  /** @ngInject */
  function EditCategoriesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core, editCategoriesService) {
  	var vm = this;
  	vm.upsert = upsert;
      vm.back = back;
    Core.init(vm,EditTableStructure);

    // insertUserDataIntoStructure();
    vm.smartTableStructure.forEach(function(obj){
      obj.value = editCategoriesService.get(obj.key);
    })

  	function upsert(obj){
  	  console.log("edit",obj);
      editCategoriesService.saveCategoryDetails(obj).then(function(response){
          $state.go('categories');
      })
  	}

    function back(){
        $state.go('categories');
    }
    
  }

})();
