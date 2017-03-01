
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension.categories')
        .controller('EditExtensionLayerCategoriesCtrl', EditExtensionLayerCategoriesCtrl);

    /** @ngInject */
    function EditExtensionLayerCategoriesCtrl($scope,$state, EditTableStructure, editExtensionLayerService, editExtensionLayerCategoriesService, Core, EditTableData, $uibModal) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.smartTableData = EditTableData;
        Core.init(this,EditTableStructure,editExtensionLayerCategoriesService);

        var parentCtrl = $scope.$parent.$parent.vm;
        var editLayerCtrl = $scope.$parent.$parent.$parent.vmEditLayerCtrl;

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function toggleCategory(categoryRow){
            console.log(categoryRow);
        }


        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }

        function chooseRow(obj,index){
            return editLayerCtrl.chooseRow(obj,index,editExtensionLayerService,parentCtrl)
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
    }

})();
