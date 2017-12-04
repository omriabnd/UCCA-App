
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.projects')
        .controller('EditProjectsCtrl', EditProjectsCtrl);

    /** @ngInject */
    function EditProjectsCtrl($stateParams, $state, EditTableStructure, Core, editProjectsService, toastr) {
        var vm = this;
        vm.upsert = upsert;
        vm.chooseLayer = chooseLayer;
        vm.refreshData = refreshData;
        vm.manage = manage;
        vm.back = back;
        Core.init(vm,EditTableStructure,editProjectsService);

        vm.smartTableStructure.forEach(function(obj){
            if(obj.dontBindToService != true){
                obj.value = editProjectsService.get(obj.key);
            }
        });

        function upsert(obj){
            console.log("edit",obj);

            var isValid = Core.validate(obj);
            if(isValid){
                var projectID = editProjectsService.get("id");                
                editProjectsService.saveProjectDetails(obj).then(function(response){
                    if(Core.hasValue(projectID)){
                        editProjectsService.clearData();
                        $state.go('projects');
                    }else{
                        Core.showNotification('success',"Project Saved.")
                        // editProjectsService.set("id",response.id);
                        // refreshData("id");
                        // $state.go('edit.projects',{id:response.id},{reload:true})
                        $state.go('projects')
                    }
                    
                }) 
            }
            
        }

        function manage (formElem){
            var dependenciesKeys  = !!formElem.validationRule ? formElem.validationRule.dependenciesKeys : [];
            var canProceed = Core.checkDependenciesKeys(dependenciesKeys,vm.smartTableStructure);

            if(canProceed < 0){
                if(formElem == 'tasks' || formElem.managePageRoute == 'tasks'){ // formElem here its the pageRoute
                    $state.go('projectTasks',{id:$stateParams.id,layerType:editProjectsService.get('layer')[0].type})
                }else{
                    $state.go('edit.projects.'+formElem) // formElem here its the pageRoute
                }
            }else{
                Core.showNotification('error',formElem.validationRule.dependenciesKeys[canProceed].errorMessage);
            }



        }

        function chooseLayer(){
            $state.go("edit.projects.layers")
        }

        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editProjectsService.get(obj.key) : "";
            })
        }

        function back(){
            $state.go('projects');
        }


    }

})();
