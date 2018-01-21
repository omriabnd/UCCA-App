
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.root.categories')
        .controller('EditRootLayerCategoriesCtrl', EditRootLayerCategoriesCtrl);

    /** @ngInject */
    function EditRootLayerCategoriesCtrl($scope,$state, EditTableStructure, editRootLayerService, editRootLayerCategoriesService, Core, EditTableData, $uibModal, editCategoriesService) {
        var vm = this;
        vm.edit = edit;
        vm.upsert = upsert;
        vm.editRow = editRow;
        vm.newCategory = newCategory;
        vm.chooseRow = chooseRow;
        vm.showCategoryInfo = showCategoryInfo;
        vm.smartTableData = EditTableData;
        Core.init(this,EditTableStructure,editRootLayerCategoriesService);

        var parentCtrl = $scope.$parent.$parent.vm;
        var editLayerCtrl = $scope.$parent.$parent.$parent.vmEditLayerCtrl;

        function newCategory (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers.root.categories.create',{});
            // $state.go('edit.passages.texts',{})
        }

        function toggleCategory(categoryRow){
            console.log(categoryRow);
        }

        function upsert(obj){
            console.log("edit",obj);
            editCategoriesService.saveCategoryDetails(obj).then(function(response){
                if($state.current.name.indexOf(".categories.create") > -1){
                      var goToState = $state.current.name.replace("create","manage");
                      $state.go(goToState,{},{reload:true});
                }else{
                    history.back();
                }
            })
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.sources',{id:obj.id})
        }
        function chooseRow(obj,index){
            console.log('chooseRow: root');
            return editLayerCtrl.chooseRow(obj,index,editRootLayerService,parentCtrl)
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
