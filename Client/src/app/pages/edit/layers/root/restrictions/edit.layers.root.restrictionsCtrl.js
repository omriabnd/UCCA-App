
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.root.restrictions')
        .controller('EditRootLayerRestrictionsCtrl', EditRootLayerRestrictionsCtrl);

    /** @ngInject */
    function EditRootLayerRestrictionsCtrl($scope,$state, EditTableStructure, editRootLayerService, Core, EditTableData, ENV_CONST) {
        var vm = this;
        vm.toggleInCategoryToGroupOne = toggleInCategoryToGroupOne;
        vm.toggleInCategoryToGroupTwo = toggleInCategoryToGroupTwo;
        vm.save = save;
        vm.back = back;
        vm.toggleItem = toggleItem;
        vm.pageName = 'layers.restrictions';

        var defaultType =ENV_CONST.RESTRICTIONS_TYPE[0];
        var parentCtrl = $scope.$parent.vm;

        vm.restrictionsTypes = ENV_CONST.RESTRICTIONS_TYPE;
        vm.restrictionType = $state.params.chosenItem != null ? $state.params.chosenItem.type : defaultType;

        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure);

        // init restrictiopn from db - from string to array
        if(!!$state.params.id && !!$state.params.chosenItem){
            if(typeof $state.params.chosenItem.categories_1 == 'string'){
                $state.params.chosenItem.categories_1 = Core.initCategoriesStringToArray($state.params.chosenItem.categories_1)
            }
            if(typeof $state.params.chosenItem.categories_2 == 'string'){
                $state.params.chosenItem.categories_2 = Core.initCategoriesStringToArray($state.params.chosenItem.categories_2)
            }
        }
        

        vm.smartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_1.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        vm.affectedSmartTableData = angular.copy(vm.smartTableData);


        vm.affectedSmartTableData.forEach(function(field,index){
            if($state.params.chosenItem){
                field.selected = $state.params.chosenItem.categories_2.filter(function(cat){return cat.id==field.id})[0] != null;
            }else{
                field.selected = false;
            }
        });

        var categoryOneArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_1): [];
        var categoryTwoArray = $state.params.chosenItem != null ? angular.copy($state.params.chosenItem.categories_2) : [];


        function back(){
            $state.go('edit.layers.root');
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
                var categoryIndexInArray = categoryOneArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                categoryOneArray.splice(categoryIndexInArray,1)
            }
        }

        function toggleInCategoryToGroupTwo(category,categoryValue){
            if(vm.restrictionType.key !== "FORBID_ANY_CHILD"){
                if(categoryValue){
                    categoryTwoArray.push(category);
                }else{
                    var categoryIndexInArray = categoryTwoArray.map(function(e,index){return e.id}).indexOf(parseInt(category.id));
                    categoryTwoArray.splice(categoryIndexInArray,1)
                }
            }else{
                if(categoryValue){
                    Core.showNotification('error','"forbid any child" accept only one category set.')
                }
            }
        }
        
        function save(){
            if(categoryOneArray.length > 0){
                if(vm.restrictionType.key == "FORBID_ANY_CHILD" || categoryTwoArray.length > 0){
                    categoryTwoArray = vm.restrictionType.key == "FORBID_ANY_CHILD" ? [] : categoryTwoArray;
                    var restriction = Core.generateRestrictionObject(categoryOneArray,vm.restrictionType,categoryTwoArray);

                    editRootLayerService.set("restrictions",restriction, $state.params.itemRowIndex);
                    parentCtrl.refreshData("restriction");

                    back();
                }
            }
        }

        


    }

})();
