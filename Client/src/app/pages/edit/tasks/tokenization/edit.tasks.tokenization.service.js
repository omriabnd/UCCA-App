
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization')
        .service('editTokenizationTasksService', editTokenizationTasksService);

    /** @ngInject */
    function editTokenizationTasksService(apiService, Core, ENV_CONST, $state) {

        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.tasks.tokenization.getTokenizationTaskEditTableStructure().then(function (res){return res.data});
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
                var structure = prepareTaskForSend(smartTableStructure,$state.params.projectId);
                var bodyData = Core.extractDataFromStructure(structure);
                bodyData.passage = bodyData.passage[0];
                bodyData.user = bodyData.user[0];
                bodyData.type = ENV_CONST.TASK_TYPE.TOKENIZATION;
                service.clearData();
                return !bodyData.id ? apiService.edit.tasks.postTaskData(bodyData).then(function (res){return res.data}) :  apiService.edit.tasks.putTaskData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key])){
                    if(key=='status'){
                        return {id: ENV_CONST.TASK_STATUS_ID[this.Data[key]],label:this.Data[key]}
                    }
                    if(typeof this.Data[key] == "string" || typeof this.Data[key] == "boolean" || typeof this.Data[key] == "number"){
                        return this.Data[key];
                    }
                    return [this.Data[key]]
                }
                return this.Data[key];
            },
            set:function(key,obj,shouldReplace){
                if(angular.isArray(this.Data[key])){
                    shouldReplace ? this.Data[key][0] = obj : this.Data[key].push(obj);
                    
                }else{
                    this.Data[key] = obj;
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
                    passage: [],
                    parent:[],
                    user:[],
                    is_active:false,
                    is_demo:false
                };
            }
        }
        return service;
    }

    function prepareTaskForSend(smartTableStructure,projectId){
        var structure = angular.copy(smartTableStructure, structure)
        structure.forEach(function(obj){
            if(obj.key == 'status'){
                obj.value = obj.value.label; // the api call expect the 'status' to be string
            }
            if(obj.key == 'project'){
                obj.value = {
                    id:projectId
                }
            }
        })
        return structure
    }

})();
