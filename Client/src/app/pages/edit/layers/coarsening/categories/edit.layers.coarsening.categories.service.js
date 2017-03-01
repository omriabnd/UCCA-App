
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.coarsening.categories')
        .service('editCoarseningLayerCategoriesService', editCoarseningLayerCategoriesService);

    /** @ngInject */
    function editCoarseningLayerCategoriesService(apiService) {
        apiService.edit.layers.coarsening.categories.getCategoryTableData().then(function (res){
            angular.copy(res.data.results, service.tableData);
        });
        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.coarsening.categories.getEditCategoriesTableStructure().then(function (res){return res.data});
            },
            getData: function(){
                return service.tableData;
            },
            getEditCategoriesTableStructure: function(){
                return apiService.edit.layers.coarsening.categories.getEditCategoriesTableStructure().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                });
            },
            getTableData: function(searchTerms){
                return apiService.categories.getCategoriesTableData(searchTerms).then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            },
            getParentCategoriesTableData:function(searchTerms){
                return apiService.edit.layers.coarsening.categories.getParentCategoriesTableData(searchTerms).then(function (res){
                    return res.data[0].categories;
                });
            }
        };
        return service;
    }

})();