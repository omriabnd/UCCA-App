
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension.restrictions')
        .service('editExtensionLayerRestrictionsService', editExtensionLayerRestrictionsService);

    /** @ngInject */
    function editExtensionLayerRestrictionsService(apiService,editExtensionLayerService) {
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.extension.restrictions.getEditRestrictionsTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.extension.restrictions.getEditRestrictionsTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(){
                return editExtensionLayerService.Data.restrictions;
            },
            get: function(key){
                return tableData[key];
            }
        };
        return service;
    }

})();