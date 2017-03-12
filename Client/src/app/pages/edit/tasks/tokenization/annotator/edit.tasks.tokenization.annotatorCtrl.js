
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.tokenization.annotator')
        .controller('EditTokenizationTaskAnnotatorCtrl', EditTokenizationTaskAnnotatorCtrl);

    /** @ngInject */
    function EditTokenizationTaskAnnotatorCtrl($scope,$state, EditTableStructure, editTokenizationTaskAnnotatorService, editTokenizationTasksService, Core) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = editTokenizationTaskAnnotatorService.getTableData();
        Core.init(this,EditTableStructure);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTokenizationTaskAnnotatorService.get(obj.key);
        });

        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.passages.sources.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.tasks.passages.create',{from:'passages'});
            // $state.go('edit.passages.texts',{})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var sourceDetails = {
                "id":obj.id,
                "first_name":obj.first_name,
                "last_name":obj.last_name
            }
            editTokenizationTasksService.set("user",sourceDetails,0);
            parentCtrl.refreshData("user");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();
