
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.passages')
        .controller('EditTokenizationTaskPassagesCtrl', EditTokenizationTaskPassagesCtrl);

    /** @ngInject */
    function EditTokenizationTaskPassagesCtrl($scope,$state, EditTableStructure, editTokenizationTaskPassagesService, editTokenizationTasksService, Core) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = editTokenizationTaskPassagesService.getTableData();
        Core.init(this,EditTableStructure);

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
                "name":obj.name
            }
            editTokenizationTasksService.set("passages",sourceDetails);
            parentCtrl.refreshData("passages");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();
