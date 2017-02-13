
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.root')
        .controller('EditRootLayerCtrl', EditRootLayerCtrl);

    /** @ngInject */
    function EditRootLayerCtrl($scope, $timeout, $state, EditTableStructure, Core,editRootLayerService,ENV_CONST) {
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
            var value = editRootLayerService.get(obj.key);
            obj.value = value;

        });

        function back(){
            $state.go('layers');
        }

        function manage (pageRoute){
            $state.go('edit.layers.root.'+pageRoute);
        }

        function edit (pageRoute,shouldEdit,obj,index,rowItem){
            if(shouldEdit){
                $state.go('edit.layers.root.'+pageRoute,{chosenItem : rowItem, itemRowIndex: index});
            }else{
                $state.go('edit.layers.root.'+pageRoute);
            }

        }

        function upsert(obj){
            console.log("edit",obj);
            editRootLayerService.saveLayerDetails(obj).then(function(response){
                $state.go("layers")
            },function(err){
                console.log('err',err);
            })
        }

        function chooseCategory(){
            console.log("chooseCategory");
            $state.go('edit.layers.root.categories.manage');
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editRootLayerService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
         }

        function deleteItemInData(key,index){
            editRootLayerService.deleteItemInData(key,index);
        }

        function manageRestrictions(){
            console.log("manageRestriction");
            $state.go('edit.layers.root.restrictions');
        }

        function getInnerSmartTableStructure(key){
            return editRootLayerService.getInnerSmartTableStructure(key);
        }
    }

})();
