/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.annotation', [
        'zAdmin.pages.edit.tasks.annotation.annotator'
    ])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('edit.tasks.annotation', {
                url: '/annotation/:projectLayerType/:projectId/:parentTaskId/:id',
                templateUrl: 'app/pages/edit/edit.html',
                title: 'Edit Annotation Task',
                controller: 'EditAnnotationTasksCtrl',
                controllerAs: 'vm',
                resolve:{
                    EditTableStructure:['$stateParams','editAnnotationTasksService',function($stateParams,editAnnotationTasksService){
                        return editAnnotationTasksService.getEditTableStructure().then(function(res){
                            if(checkIfNeedToShowChooseParentTask($stateParams)){
                                res = setShowInTable(res,"parent",true);      
                            }
                            return res;
                        })
                    }],
                    SourceTableData:function(editAnnotationTasksService,$stateParams){
                        if($stateParams.id != ""){
                            return editAnnotationTasksService.getTaskData($stateParams.id)
                        }
                        editAnnotationTasksService.clearData();
                        return null;
                    }
                }
            });
    }

    function checkIfNeedToShowChooseParentTask(params){
        var show = false;
        if(params.projectLayerType != 'ROOT' && params.id == "" && params.parentTaskId == ""){
            show = true;
        }
        return show;
    }

    function setShowInTable(structure,key,val){
        if(!!structure){
            structure.forEach(function(obj){
                if(obj.key == key){
                    obj.showInTable = val;
                }
            })
        }
        return structure
    }


})();

