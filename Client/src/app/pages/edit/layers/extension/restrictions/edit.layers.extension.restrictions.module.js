/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension.restrictions', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.extension.restrictions', {
                url: '/restrictions/:id',
                templateUrl: 'app/pages/edit/layers/extension/restrictions/edit.layers.extension.restrictions.html',
                title: 'Manage Restrictions',
                controller: 'EditExtensionLayerRestrictionsCtrl',
                controllerAs: 'vm',
                params:{
                    chosenItem: null,
                    itemRowIndex: null
                },
                resolve:{
                    EditTableStructure:function(editExtensionLayerRestrictionsService){
                        return editExtensionLayerRestrictionsService.getEditTableStructure()
                    },
                    EditTableData:function(editExtensionLayerService){
                        return editExtensionLayerService.get('categories');
                    }
                }
            })
        ;
    }

})();