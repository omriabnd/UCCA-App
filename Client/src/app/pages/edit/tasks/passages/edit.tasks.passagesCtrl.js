
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.tasks.passages')
        .controller('EditTaskPassagesCtrl', EditTaskPassagesCtrl);

    /** @ngInject */
    function EditTaskPassagesCtrl($scope,$state, EditTableStructure, editTaskPassagesService, editTasksService, Core) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = editTaskPassagesService.getTableData();
        Core.init(this,EditTableStructure);

        vm.smartTableStructure.forEach(function(obj){
            obj.value = editTaskPassagesService.get(obj.key);
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
            editTasksService.set("passages",sourceDetails);
            parentCtrl.refreshData("passages");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();
