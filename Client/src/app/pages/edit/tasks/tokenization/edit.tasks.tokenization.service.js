
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization')
        .service('editTokenizationTasksService', editTokenizationTasksService);

    /** @ngInject */
    function editTokenizationTasksService(apiService, Core) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.getTokenizationTaskEditTableStructure().then(function (res){return res.data});
            },
            getTaskData: function(id){
                var _service = this;
                return apiService.edit.tasks.getTaskData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            getTasksTableData: function(){
                return apiService.tasks.getTasksTableData().then(function (res){
                    angular.copy(res.data, service.Data);
                });
            },
            saveTaskDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                service.clearData();
                return !bodyData.id ? apiService.edit.tasks.postTaskData(bodyData).then(function (res){return res.data}) :  apiService.edit.tasks.putTaskData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
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
            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    manager_comment:"",
                    status:"",
                    passages: [],
                    parent:[],
                    user:[],
                    is_active:"",
                    is_demo:""
                };
            }
        }
        return service;
    }

})();
