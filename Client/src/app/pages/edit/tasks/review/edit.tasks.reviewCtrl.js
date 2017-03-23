
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.review')
        .controller('EditReviewTasksCtrl', EditReviewTasksCtrl);

    /** @ngInject */
    function EditReviewTasksCtrl($scope,$state, $timeout, EditTableStructure, Core,editReviewTasksService) {
        var vm = this;
        vm.upsert = upsert;
        vm.back = back;
        vm.choosePassage = choosePassage;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.chooseAnnotator = chooseAnnotator;
        vm.manage = manage;

        Core.init(this,EditTableStructure,editReviewTasksService);

        vm.smartTableStructure.forEach(function(obj){
            if(obj.dontBindToService != true){
                obj.value = editReviewTasksService.get(obj.key);
            }
        });

        function upsert(obj){
            console.log("edit",obj);
            editReviewTasksService.saveTaskDetails(obj).then(function(response){
                $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            },function(err){
                $state.go('projectTasks',{id:response.project.id,layerType:$state.params.projectLayerType});
            })
        }

        function back(){
            var projectId = $state.params.projectId;
            $state.go('projectTasks',{id:projectId,layerType:$state.params.projectLayerType});
        }

        function manage (pageRoute){
            $state.go('edit.tasks.review.'+pageRoute+'.manage');
        }

        function choosePassage(){
            $state.go('edit.tasks.review.passages.manage');
        }

        function chooseAnnotator(){
            $state.go('edit.tasks.review.annotator.manage');
        }

        function deleteItemInData(key,index){
            editReviewTasksService.deleteItemInData(key,index);
        }


        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editReviewTasksService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
        }
    }

})();
