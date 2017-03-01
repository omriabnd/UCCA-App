(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.coarsening', [
        'zAdmin.pages.edit.layers.coarsening.categories'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.coarsening', {
                url: '/coarsening/{id}',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Coarsening Layer',
                controller: 'EditCoarseningLayerCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editCoarseningLayerService){
                        return editCoarseningLayerService.getEditTableStructure();
                    },
                    SourceTableData:function(editCoarseningLayerService,$stateParams,storageService){

                        return editCoarseningLayerService.getLayerData($stateParams.id).then(function(res){

                            var shouldEdit = storageService.getFromLocalStorage("shouldEditLayer");

                            shouldEdit == 'false' ? editCoarseningLayerService.initDataForCoarseningLayer() : '';

                            return editCoarseningLayerService.Data;
                        })
                    }
                }
            });

    }



})();