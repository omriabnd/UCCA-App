
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.coarsening')
        .controller('EditCoarseningLayerCtrl', EditCoarseningLayerCtrl);

    /** @ngInject */
    function EditCoarseningLayerCtrl($scope, $timeout, $state, $stateParams, EditTableStructure, Core,editCoarseningLayerService, storageService) {
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

        Core.init(this,EditTableStructure,editCoarseningLayerService);

        vm.smartTableStructure.forEach(function(obj){
            var value = editCoarseningLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            $state.go('edit.layers.coarsening.'+pageRoute,{parentId: editCoarseningLayerService.get('parent').id});
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editCoarseningLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                $state.go("layers")
            })
        }

        function chooseCategory(){
            $state.go('edit.layers.coarsening.categories.manage',{parentId: editCoarseningLayerService.get('parent').id});
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editCoarseningLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editCoarseningLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.restrictions');
        }

        function getInnerSmartTableStructure(key){
            return editCoarseningLayerService.getInnerSmartTableStructure(key);
        }

        function toggleItem(){

        }
    }

})();
