
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.root.restrictions')
        .service('editRootLayerRestrictionsService', editRootLayerRestrictionsService);

    /** @ngInject */
    function editRootLayerRestrictionsService(apiService,editRootLayerService) {
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.root.restrictions.getEditRestrictionsTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.root.restrictions.getEditRestrictionsTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(){
                return editRootLayerService.Data.restrictions;
            },
            get: function(key){
                return tableData[key];
            }
        };
        return service;
    }

})();