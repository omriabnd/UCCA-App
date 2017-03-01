
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.passages')
        .service('editTaskPassagesService', editTaskPassagesService);

    /** @ngInject */
    function editTaskPassagesService(apiService) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.passages.getPassagesTableStructure().then(function (res){return res.data});
            },
            getTableData: function(){
                return service.Data;
            },
            getPassagesTableData: function(id){
                apiService.passages.getPassagesTableData(id).then(function (res){
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
        }
        return service;
    }

})();