
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.passages')
        .controller('EditTokenizationTaskPassagesCtrl', EditTokenizationTaskPassagesCtrl);

    /** @ngInject */
    function EditTokenizationTaskPassagesCtrl($scope,$state, EditTableStructure, editTokenizationTaskPassagesService, editTokenizationTasksService, Core, PassagesTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = PassagesTableData;
        Core.init(this,EditTableStructure,editTokenizationTaskPassagesService);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTokenizationTaskPassagesService.get(obj.key);
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
                "short_text":obj.text,
                "type":obj.type
            }
            editTokenizationTasksService.set("passage",sourceDetails,true);
            parentCtrl.refreshData("passage");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();
