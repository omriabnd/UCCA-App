(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.root', [
        'zAdmin.pages.edit.layers.root.categories',
        'zAdmin.pages.edit.layers.root.restrictions'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.root', {
                url: '/root/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Root Layer',
                controller: 'EditRootLayerCtrl',
                controllerAs: 'vm',
                params:{
                    layerType: null
                },
                resolve:{
                    EditTableStructure:function(editRootLayerService){
                        return editRootLayerService.getEditTableStructure();
                    },
                    SourceTableData:function(editRootLayerService,$stateParams){
                        if($stateParams.id != ""){

                            return editRootLayerService.getLayerData($stateParams.id).then(function(res){

                                return editRootLayerService.Data;
                            })

                        }
                        editRootLayerService.clearData();
                        return null;
                    }
                }
            });



    }



})();