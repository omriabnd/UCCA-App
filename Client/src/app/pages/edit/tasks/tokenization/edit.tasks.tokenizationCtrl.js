
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization')
        .controller('EditTokenizationTasksCtrl', EditTokenizationTasksCtrl);

    /** @ngInject */
    function EditTokenizationTasksCtrl($scope,$state, $timeout, EditTableStructure, Core,editTokenizationTasksService) {
        var vm = this;
        vm.upsert = upsert;
        vm.back = back;
        vm.choosePassage = choosePassage;
        vm.refreshData = refreshData;
        vm.deleteItemInData = deleteItemInData;
        vm.chooseAnnotator = chooseAnnotator;

        Core.init(this,EditTableStructure);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTokenizationTasksService.get(obj.key);
        });

        function upsert(obj){
            console.log("edit",obj);
            editTokenizationTasksService.saveTaskDetails(obj).then(function(response){
                $state.go("tasks")
            },function(err){
                $state.go("tasks")
            })
        }

        function back(){
            $state.go('tasks');
        }

        function choosePassage(){
            $state.go('edit.tasks.tokenization.passages.manage');
        }

        function chooseAnnotator(){
            $state.go('edit.tasks.tokenization.annotator.manage');
        }

        function deleteItemInData(key,index){
            editTokenizationTasksService.deleteItemInData(key,index);
        }


        function refreshData(key){
            // set values from service
            vm.smartTableStructure.forEach(function(obj){
                key == obj.key ? obj.value = editTokenizationTasksService.get(obj.key) : "";
            })

            $timeout(function(){
                $scope.$apply();
            })

            // $state.go('edit.layers');
        }
    }

})();
