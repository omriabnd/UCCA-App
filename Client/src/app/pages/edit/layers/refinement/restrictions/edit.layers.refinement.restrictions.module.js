(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.refinement.restrictions', [

    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.layers.refinement.restrictions', {
                url: '/restrictions/:id',
                templateUrl: 'app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.html',
                title: 'Manage Restrictions',
                controller: 'EditRefinementLayerRestrictionsCtrl',
                controllerAs: 'vm',
                params:{
                    chosenItem: null,
                    itemRowIndex: null
                },
                resolve:{
                    EditTableStructure:function(editRefinementLayerRestrictionsService){
                        return editRefinementLayerRestrictionsService.getEditTableStructure()
                    },
                    EditTableData:function(editRefinementLayerService){
                        return editRefinementLayerService.get('categories');
                    }
                }
            })
        ;
    }

})();