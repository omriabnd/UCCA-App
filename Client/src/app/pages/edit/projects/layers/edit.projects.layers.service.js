
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.projects.layers')
        .service('editProjectLayerService', editProjectLayerService);

    /** @ngInject */
    function editProjectLayerService(apiService) {

        var service = {
            tableData:[],
            getEditTableStructure: function(){
                return apiService.edit.projects.layer.getSelectTableStructure().then(function (res){return res.data});
            },
            getTableData: function(){
                return apiService.edit.projects.layer.getLayersTableData().then(function (res){
                    angular.copy(res.data.results, service.tableData);
                    return service.tableData;
                });
            },
            getLayersTableData: function(){
                var _service = this;
                return apiService.edit.projects.layer.getLayersTableData().then(function (res){
                    angular.copy(res.data.results, _service.tableData);
                    return _service.tableData;
                });
            }
        }
        return service;
    }

})();