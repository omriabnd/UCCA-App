
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.refinement')
        .controller('EditRefinementLayerCtrl', EditRefinementLayerCtrl);

    /** @ngInject */
    function EditRefinementLayerCtrl($scope, $timeout, $state, $stateParams, EditTableStructure, Core,editRefinementLayerService, storageService) {
        var vm = this;
        vm.back = back;
        vm.upsert = upsert;
        vm.manage = manage;
        vm.edit = edit;
        vm.chooseCategory = chooseCategory;
        vm.manageRestrictions = manageRestrictions;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.getInnerSmartTableStructure = getInnerSmartTableStructure;

        // var layerType = storageService.getFromLocalStorage('layerType');
        //
        // updateTableDataAccordingToLayerType(layerType);

        Core.init(this,EditTableStructure);

        vm.smartTableStructure.forEach(function(obj){
            var value = editRefinementLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            $state.go('edit.layers.refinement.'+pageRoute,{parentId: editRefinementLayerService.get('parent').id});
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.refinement.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.refinement.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editRefinementLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                $state.go("layers")
            })
        }

        function chooseCategory(){
            $state.go('edit.layers.refinement.categories.manage',{parentId: editRefinementLayerService.get('parent').id});
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editRefinementLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editRefinementLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.refinement.restrictions');
        }

        function getInnerSmartTableStructure(key){
            return editRefinementLayerService.getInnerSmartTableStructure(key);
        }

        function toggleItem(){

        }
    }

})();
