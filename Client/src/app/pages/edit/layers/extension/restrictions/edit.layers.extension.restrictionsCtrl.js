
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension.restrictions')
        .controller('EditExtensionLayerRestrictionsCtrl', EditExtensionLayerRestrictionsCtrl);

    /** @ngInject */
    function EditExtensionLayerRestrictionsCtrl($scope,$state, EditTableStructure, editExtensionLayerService, Core, EditTableData, ENV_CONST) {
        var vm = this;
        vm.toggleInCategoryToGroupOne = toggleInCategoryToGroupOne;
        vm.toggleInCategoryToGroupTwo = toggleInCategoryToGroupTwo;
        vm.save = save;
        vm.back = back;
        vm.toggleItem = toggleItem;
        vm.pageName = 'layers.restrictions';

        var parentCtrl = $scope.$parent.vm;

        var defaultType =ENV_CONST.RESTRICTIONS_TYPE[0];

        vm.restrictionsTypes = ENV_CONST.RESTRICTIONS_TYPE;
        vm.restrictionType = $state.params.chosenItem != null ? $state.params.chosenItem.type : defaultType;

        vm.smartTableData = $state.params.chosenItem != null ? $state.params.chosenItem.categories_1 : EditTableData;

        Core.init(this,EditTableStructure);

        vm.smartTableData.forEach(function(field,index){
            field.selected = $state.params.chosenItem != null;
        });

        vm.affectedSmartTableData = $state.params.chosenItem != null ? $state.params.chosenItem.categories_2 : angular.copy(vm.smartTableData);


        vm.affectedSmartTableData.forEach(function(field,index){
            field.selected = $state.params.chosenItem != null;
        });

        var categoryOneArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_1): [];
        var categoryTwoArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_2) : [];


        function back(){
            $state.go('edit.layers.extension');
        }

        function toggleItem(categoryName, category,categoryValue){
             if(categoryName =='category_1'){
                vm.toggleInCategoryToGroupOne(category,categoryValue);
            }else{
                vm.toggleInCategoryToGroupTwo(category,categoryValue);
            }
        }
        function toggleInCategoryToGroupOne(category,categoryValue){
            if(categoryValue){
                categoryOneArray.push(category);
            }else{
                var categoryIndexInArray = categoryOneArray.map(function(e,index){return index}).indexOf(parseInt(category.id));
                categoryOneArray.splice(categoryIndexInArray,1)
            }
        }

        function toggleInCategoryToGroupTwo(category,categoryValue){
            if(categoryValue){
                categoryTwoArray.push(category);
            }else{
                var categoryIndexInArray = categoryTwoArray.map(function(e,index){return index}).indexOf(parseInt(category.id));
                categoryTwoArray.splice(categoryIndexInArray,1)
            }
        }

        function save(){
            if(categoryOneArray.length > 0 && categoryTwoArray.length > 0){
                var restriction = {
                    categories_1: categoryOneArray,
                    type:vm.restrictionType,
                    categories_2: categoryTwoArray
                };

                editExtensionLayerService.set("restrictions",restriction, $state.params.itemRowIndex);
                parentCtrl.refreshData("restriction");
                $state.go('edit.layers.extension')
            }


        }

    }

})();
