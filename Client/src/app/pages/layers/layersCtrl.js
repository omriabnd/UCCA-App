
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.layers')
      .controller('layersCtrl', layersCtrl);

  /** @ngInject */
  function layersCtrl($state, layersService, TableStructure, Core, TableData, storageService) {

    var vm = this;
    vm.smartTableData = TableData;

    Core.init(vm,TableStructure,layersService);


    vm.editRow = editRow;
    vm.createExtensionLayer = createExtensionLayer;
    vm.createCoarseningLayer = createCoarseningLayer;
    vm.createRefinementLayer = createRefinementLayer;

    function editRow (obj,index){
      console.log("editRow " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",true);
      $state.go('edit.layers.'+obj.type.toLowerCase(),{id:obj.id, shouldEdit: true})
    }

    function createExtensionLayer(obj,index){
      console.log("editRow extension " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",false);
      $state.go('edit.layers.extension',{id:obj.id})
    }

    function createCoarseningLayer(obj,index){
      console.log("editRow coarsening " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",false);
      $state.go('edit.layers.coarsening',{id:obj.id})
    }

    function createRefinementLayer(obj,index){
      console.log("editRow refinement " + index,obj);
      storageService.saveInLocalStorage("shouldEditLayer",false);
      $state.go('edit.layers.refinement',{id:obj.id})
    }

  }

})();
