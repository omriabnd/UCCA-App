
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.categories')
      .controller('EditCategoriesCtrl', EditCategoriesCtrl);

  /** @ngInject */
  function EditCategoriesCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, Core, editCategoriesService) {
  	var vm = this;
  	vm.upsert = upsert;
    vm.back = back;
    Core.init(vm,EditTableStructure,editCategoriesService);

    // insertUserDataIntoStructure();
    vm.smartTableStructure.forEach(function(obj){
      obj.value = editCategoriesService.get(obj.key);
    })

  	function upsert(obj){
  	  console.log("edit",obj);
      editCategoriesService.saveCategoryDetails(obj).then(function(response){
          // $state.go('categories');
          if($state.current.name.indexOf(".categories.create") > -1){
            var goToState = $state.current.name.replace("create","manage");
            $state.go(goToState,{},{reload:true});
          }else{
            history.back();
          }
      })
  	}

    function back(){
        // $state.go('categories');
        history.back();
    }
    
  }

})();
