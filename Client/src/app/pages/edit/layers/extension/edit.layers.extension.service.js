
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.extension')
        .service('editExtensionLayerService', editExtensionLayerService);

    /** @ngInject */
    function editExtensionLayerService(apiService, Core, ENV_CONST) {
        /*apiService.sources.getSourceTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.extension.getEditLayerTableStructure().then(function (res){return res.data});
            },
            getLayerData: function(id){
                var _service = this;
                return apiService.edit.layers.extension.getLayerData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveLayerDetails: function(smartTableStructure){
                var bodyData = Core.extractDataFromStructure(smartTableStructure);
                service.clearData();
                return !bodyData.id ? apiService.edit.layers.extension.postLayerData(bodyData).then(function (res){return res.data}) :  apiService.edit.layers.extension.putLayerData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                service.Data = data;
            },
            get:function(key){
                return this.Data[key];
            },
            getInnerSmartTableStructure: function(key){
                return this.Data[key].tableStructure;
            },
            set:function(key,obj,indexToInsert){
                if(angular.isArray(this.Data[key])){
                    indexToInsert == null ? this.Data[key].push(obj) : this.Data[key][indexToInsert] = obj;
                    
                }else{                    
                    this.Data[key][0] = obj;
                }
            },
            initStructureForCoarseningLayer: function(){
                var _service = this;
                return apiService.edit.layers.extension.getCoarseningLayerTableStructure().then(function (res){
                    return res.data
                });
            },
            initDataForExtensionLayer: function(){
                var parentLayer = service.Data;
                service.clearData();
                service.Data.parent = [parentLayer];
            },
            initDataForCoarseningLayer: function(){

            },
            initDataForRefinementLayer: function(){

            },
            deleteItemInData: function(key,index){
                service.Data[key].splice(index,1);
            },
            clearData: function(){
                service.Data = {
                    "name": "",
                    "description": "",
                    "id": "",
                    "parent": false,
                    "children": [],
                    "type": ENV_CONST.LAYER_TYPE.EXTENSION,
                    "tooltip": "",
                    "projects": [  ],
                    "categories": [],
                    "restrictions": [],
                    "created_by": {
                        "first_name":"",
                        "last_name":"",
                        "name":""
                    },
                    "is_active": false,
                    "created_at": "",
                    "updated_at": ""
                };
            }
        };
        return service;
    }

})();
