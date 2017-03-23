
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.review.annotator')
        .controller('EditReviewTaskAnnotatorCtrl', EditReviewTaskAnnotatorCtrl);

    /** @ngInject */
    function EditReviewTaskAnnotatorCtrl($scope,$state, EditTableStructure, editReviewTaskAnnotatorService, editReviewTasksService, Core, UserTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = UserTableData;
        Core.init(this,EditTableStructure,editReviewTaskAnnotatorService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editReviewTaskAnnotatorService.get(obj.key);
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
            editReviewTasksService.set("user",sourceDetails,true);
            parentCtrl.refreshData("user");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();
