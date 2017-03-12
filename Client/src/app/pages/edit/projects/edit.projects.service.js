
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.projects')
        .service('editProjectsService', editProjectsService);

    /** @ngInject */
    function editProjectsService(apiService, Core) {
        /*apiService.projects.getProjectsTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.projects.getEditProjectTableStructure().then(function (res){return res.data});
            },
            getProjectData: function(id){
                var _service = this;
                return apiService.edit.projects.getProjectData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveProjectDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                return bodyData.id ? apiService.edit.projects.putProjectData(bodyData).then(function (res){return res.data}) :  apiService.edit.projects.postProjectData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                var _service = this;
                service.Data = data;
            },
            get:function(key){
                if(!angular.isArray(this.Data[key])){
                    if(this.Data[key] == ""){
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
            getData: function(){
              return this.Data;
            },
            clearData: function(){
                service.Data = {
                    id:"",
                    name:"",
                    description:"",
                    layer: "",
                    tooltip:"",
                    tasks:[],
                    created_by:"",
                    is_active:"",
                    created_at:"",
                    updated_at:""
                };
                return service.Data;
            }
        };
        return service;
    }

})();
