
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.refinement.restrictions')
        .service('editRefinementLayerRestrictionsService', editRefinementLayerRestrictionsService);

    /** @ngInject */
    function editRefinementLayerRestrictionsService(apiService,editRefinementLayerService) {
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.refinement.restrictions.getEditRestrictionsTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.refinement.restrictions.getEditRestrictionsTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(){
                return editRefinementLayerService.Data.restrictions;
            },
            get: function(key){
                return tableData[key];
            }
        };
        return service;
    }

})();