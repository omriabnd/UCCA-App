
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension')
        .controller('EditExtensionLayersCtrl', EditExtensionLayersCtrl);

    /** @ngInject */
    function EditExtensionLayersCtrl($scope, $timeout, $state, EditTableStructure, Core,editExtensionLayerService,ENV_CONST) {
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
            var value = editExtensionLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            $state.go('edit.layers.extension.'+pageRoute);
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.extension.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.extension.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editExtensionLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                $state.go("layers")
            })
        }

        function chooseCategory(){
            console.log("chooseCategory");
            $state.go('edit.layers.extension.categories.manage');
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editExtensionLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editExtensionLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.extension.restrictions');
        }

        function getInnerSmartTableStructure(key){
            return editExtensionLayerService.getInnerSmartTableStructure(key);
        }
    }

})();
