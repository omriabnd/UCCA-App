/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.root.categories', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.root.categories', {
                url: '/categories',
                template: '<ui-view></ui-view>',
                title: 'Edit Root Layer',
                abstract:true,
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editRootLayerCategoriesService){return editRootLayerCategoriesService.getEditTableStructure()},
                    EditTableData:function(editRootLayerCategoriesService){return editRootLayerCategoriesService.getTableData()}
                }
            })
            .state('edit.layers.root.categories.manage', {
                url: '/managecategories',
                templateUrl: 'app/pages/edit/layers/root/categories/edit.layers.root.categories.html',
                title: 'Edit Root Layer',
                controller: 'EditRootLayerCategoriesCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editRootLayerCategoriesService){
                        return editRootLayerCategoriesService.getEditTableStructure()
                    }
                }
            })
            .state('edit.layers.root.categories.create', {
                url: '/newctegories',
                templateUrl: 'app/pages/edit/layers/root/categories/edit.layers.root.categories.create.html',
                title: 'Edit Root Layer',
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