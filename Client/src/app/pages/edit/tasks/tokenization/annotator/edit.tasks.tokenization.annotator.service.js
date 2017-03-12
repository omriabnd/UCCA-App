
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization.annotator')
        .service('editTokenizationTaskAnnotatorService', editTokenizationTaskAnnotatorService);

    /** @ngInject */
    function editTokenizationTaskAnnotatorService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.tokenization.annotator.getAnnotatorsTableStructure().then(function (res){return res.data});
            },
            getTableData: function(){
                return service.Data;
            },
            getUserTableData: function(id){
                apiService.users.getUsersTableData(id).then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            get:function(key){
                if(!angular.isArray(this.Data[key]) && this.Data[key] != null){
                    return [this.Data[key]]
                }
                return this.Data[key]
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;

                }else{
                    this.Data[key][0] = obj;
                }
            }
        };
        return service;
    }

})();