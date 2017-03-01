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
                title: 'Edit Categories',
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
                title: 'Edit Root Layer Categories',
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