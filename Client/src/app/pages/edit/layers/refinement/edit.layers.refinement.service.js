
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.layers.refinement')
        .service('editRefinementLayerService', editRefinementLayerService);

    /** @ngInject */
    function editRefinementLayerService(apiService, Core, ENV_CONST) {
        /*apiService.sources.getSourceTableData().then(function (res){
         angular.copy(res.data.results, service.tableData);
         });*/
        var service = {
            Data:[],
            getEditTableStructure: function(){
                return apiService.edit.layers.refinement.getEditLayerTableStructure().then(function (res){return res.data});
            },
            getLayerData: function(id){
                var _service = this;
                return apiService.edit.layers.refinement.getLayerData(id).then(function (res){
                    _service.initData(res.data);
                    return res.data
                });
            },
            saveLayerDetails: function(smartTableStructure){
                var structure = prepareLayerCategoriesForSend(smartTableStructure);
                var bodyData = Core.extractDataFromStructure(structure);
                service.clearData();
                return !bodyData.id ? apiService.edit.layers.refinement.postLayerData(bodyData).then(function (res){return res.data}) :  apiService.edit.layers.refinement.putLayerData(bodyData).then(function (res){return res.data});
            },
            initData:function(data){
                var categories = prepareRefinementCategories(data.categories);
                if(categories.length){
                    data.categories = categories;
                }
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
            initDataForRefinementLayer: function(){
                var _service = this;
                var initialData = _service.Data;
                _service.clearData();
                _service.Data.type = ENV_CONST.LAYER_TYPE.REFINEMENT;
                _service.Data.restrictions = [];
                _service.Data.parent = initialData;
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
                    "type": ENV_CONST.LAYER_TYPE.REFINEMENT,
                    "tooltip": "",
                    "projects": [  ],
                    "categories": [],
                    "restrictions": [],
                    "created_by": {
                        "first_name":"",
                        "last_name":"",
                        "name":""
                    },
                    "is_active": true,
                    "created_at": "",
                    "updated_at": ""
                };
            }
        };
        return service;
    }
    
    /*
    * transform the categories array to group by parentCategory
    */
    function prepareRefinementCategories(categories){
        if(!categories){
            return categories;
        }else{
            var response = [];
            var parentCategories = {};
            var pairs = {};

            categories.forEach(function(cat){
                if(cat.parent){
                    parentCategories[cat.parent.id] = cat.parent;
                }
            });

            Object.keys(parentCategories).forEach(function(parentId){
                pairs[parentId] = {
                    'parent_category': [parentCategories[parentId]],
                    'category': []
                }
            });

            categories.forEach(function(cat){
                if(cat.parent){
                    pairs[cat.parent.id].category.push(cat)
                }
            });
            
            Object.keys(pairs).forEach(function(parentId){
                response.push(pairs[parentId])
            });
            
            return response;
        }
    }

    function prepareLayerCategoriesForSend(smartTableStructure){
        //refinement
        var structure = angular.copy(smartTableStructure, structure);
        structure.forEach(function(rowObj){
            if(rowObj.key == 'categories'){
                var parsedCategories = [];
                rowObj.value.forEach(function(valueObj){
                    valueObj.category.forEach(function(categoryObj){
                        var category = {
                            id: categoryObj.id,
                            name: categoryObj.name,
                            shortcut_key: categoryObj.shortcut_key,
                            parent: {
                                id: valueObj.parent_category[0].id,
                                name: valueObj.parent_category[0].name
                            }
                        }
                        parsedCategories.push(category)
                    })
                })
                rowObj.value = parsedCategories;
            }
        });
        return structure;
    }

})();
