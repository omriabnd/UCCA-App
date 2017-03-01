(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.refinement', [
        'zAdmin.pages.edit.layers.refinement.categories',
        'zAdmin.pages.edit.layers.refinement.restrictions'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.refinement', {
                url: '/refinement/{id}',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Refinement Layer',
                controller: 'EditRefinementLayerCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:function(editRefinementLayerService){
                        return editRefinementLayerService.getEditTableStructure();
                    },
                    SourceTableData:function(editRefinementLayerService,$stateParams,storageService){

                        return editRefinementLayerService.getLayerData($stateParams.id).then(function(res){

                            var shouldEdit = storageService.getFromLocalStorage("shouldEditLayer");

                            shouldEdit == 'false' ? editRefinementLayerService.initDataForRefinementLayer() : '';

                            return editRefinementLayerService.Data;
                        })
                    }
                }
            });

    }



})();