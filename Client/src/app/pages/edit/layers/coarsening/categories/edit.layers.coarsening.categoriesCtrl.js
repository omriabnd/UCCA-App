
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.coarsening.categories')
        .controller('EditCoarseningLayerCategoriesCtrl', EditCoarseningLayerCategoriesCtrl);

    /** @ngInject */
    function EditCoarseningLayerCategoriesCtrl($scope,$state, $timeout, EditTableStructure, editCoarseningLayerService, editCoarseningLayerCategoriesService, Core, EditTableData, $uibModal, parentCategoriesSmartTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.toggleItem = toggleItem;
        vm.back = back;
        vm.save = save;

        var parentController = $scope.$parent.$parent.vm;

        vm.parentCategoriesSmartTableData = parentCategoriesSmartTableData;
        vm.smartTableData = EditTableData;

        Core.init(this,EditTableStructure,editCoarseningLayerCategoriesService);

        var parentCategories = [];
        var newMergedCategories = [];

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var LayerDetails = {
                "id":obj.id,
                "name":obj.name,
                "shortcut_key": obj.shortcut_key,
                "abbreviation":obj.abbreviation

            };
            var itemNotAlreadySelected = Core.findItemInArrayById(LayerDetails.id,editCoarseningLayerService.get('categories'));
            if(itemNotAlreadySelected){
                promptHotKeySelectionModal(obj,LayerDetails,parentController);
            }
        }

        function promptHotKeySelectionModal(obj,LayerDetails,parentCtrl){
            $uibModal.open({
                animation: true,
                templateUrl: '../app/pages/edit/layers/select.hotkey.modal.html',
                size: 'md',
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                },
                controller: function($scope, $uibModalInstance) {
                    $scope.categoryHotKey = null;

                    $scope.save = function() {
                        if($scope.categoryHotKey != null && $scope.categoryHotKey != ''){
                            obj.selected = true;
                            LayerDetails.shortcut_key = $scope.categoryHotKey;
                            editCoarseningLayerService.set("categories",LayerDetails);
                            parentCtrl.refreshData("categories");
                            $uibModalInstance.dismiss('cancel');
                        }
                    };

                    $scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
        }
        function showCategoryInfo(obj,index){
            var pagelink = pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html';
            var size = size || 'lg';
            $uibModal.open({
                animation: true,
                templateUrl: pagelink,
                size: size,
                controller: function ($scope) {
                    $scope.name = obj.name;
                    $scope.description = obj.description;
                }
            });
        }

        function edit(obj){
            console.log("edit",obj);
        }

        function toggleItem(categoryName,category,categoryValue){
            var itemNotAlreadySelected = true;
            if( categoryName == 'parent'){
                var categoryObj = {
                    "id":category.id,
                    "name":category.name
                };
                itemNotAlreadySelected = Core.findItemInArrayById(categoryObj.id,parentCategories);
                if(itemNotAlreadySelected){
                    parentCategories.push(categoryObj);
                    category.selected = true;
                }
            }else{
                var categoryObj = [{
                    "id":categoryName.id,
                    "name":categoryName.name
                }];
                itemNotAlreadySelected = Core.findItemInArrayById(categoryObj.id,newMergedCategories);
                if(itemNotAlreadySelected){
                    $('#categories-table .selected').removeClass('selected');
                    if(newMergedCategories.length > 0){
                        var objectPositionInCategoriesArray = Core.findItemPositionInArrayById(newMergedCategories[0].id,vm.smartTableData);
                        vm.smartTableData[objectPositionInCategoriesArray].selected = false;
                    }
                    newMergedCategories = categoryObj;

                    categoryName.selected = true;

                    $timeout(function(){
                        $scope.$apply();
                    })


                }
            }
        }

        function save(){
            if(parentCategories.length > 0 && newMergedCategories.length > 0){
                var categoryDetails = {
                    'parent_category': parentCategories,
                    'category': newMergedCategories
                };

                editCoarseningLayerService.set("categories",categoryDetails);
                parentController.refreshData("categories");
            }
            $state.go('edit.layers.coarsening')
        }

        function back(){
            $state.go('edit.layers.coarsening')
        }
    }

})();
