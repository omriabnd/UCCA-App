
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension.categories')
        .service('editExtensionLayerCategoriesService', editExtensionLayerCategoriesService);

    /** @ngInject */
    function editExtensionLayerCategoriesService(apiService) {
        apiService.edit.layers.extension.categories.getCategoryTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.extension.categories.getEditCategoriesTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.extension.categories.getEditCategoriesTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(searchTerms){
                return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            }
        };
        return service;
    }

})();