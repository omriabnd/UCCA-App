(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension', [
        'zAdmin.pages.edit.layers.extension.categories',
        'zAdmin.pages.edit.layers.extension.restrictions'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.extension', {
                url: '/extension/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Extension Layers',
                controller: 'EditExtensionLayersCtrl',
                controllerAs: 'vm',
                params:{
                    layerType: null,
                    shouldEdit: false
                },
                resolve:{
                    EditTableStructure:function(editExtensionLayerService){
                        return editExtensionLayerService.getEditTableStructure();
                    },
                    SourceTableData:function(editExtensionLayerService,$stateParams,storageService){

                        return editExtensionLayerService.getLayerData($stateParams.id).then(function(res){

                            var shouldEdit = storageService.getFromLocalStorage("shouldEditLayer");

                            shouldEdit == 'false' ? editExtensionLayerService.initDataForExtensionLayer() : '';

                            return editExtensionLayerService.Data;
                        })
                    }
                }
            });

    }



})();