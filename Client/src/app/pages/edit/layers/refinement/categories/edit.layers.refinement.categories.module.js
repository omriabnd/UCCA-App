/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.refinement.categories', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.refinement.categories', {
                url: '/categories',
                template: '<ui-view></ui-view>',
                title: 'Edit Refinement Layer Categories',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editRefinementLayerCategoriesService){return editRefinementLayerCategoriesService.getEditTableStructure()},
                    EditTableData:function(editRefinementLayerCategoriesService){return editRefinementLayerCategoriesService.getTableData()}
                }
            })
            .state('edit.layers.refinement.categories.manage', {
                url: '/categories',
                templateUrl: 'app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.html',
                title: 'Edit Categories',
                controller: 'EditRefinementLayerCategoriesCtrl',
                controllerAs: 'vm',
                params:{
                    parentId: null,
                },
                resolve:{
                    EditTableStructure:function(editRefinementLayerCategoriesService){
                        return editRefinementLayerCategoriesService.getEditTableStructure()
                    },
                    parentCategoriesSmartTableData: function(editRefinementLayerCategoriesService,$stateParams){
                        var searchTerms = [{'searchKey': 'id', 'searchValue': $stateParams.parentId}]
                        return editRefinementLayerCategoriesService.getParentCategoriesTableData(searchTerms)
                    }
                }
            })
            .state('edit.layers.refinement.categories.create', {
                url: '/newctegories',
                templateUrl: 'app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.create.html',
                title: 'New Category',
                controller: 'EditCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editCategoriesService){
                        return editCategoriesService.getEditTableStructure()
                    }
                }
            })
        ;
    }

})();