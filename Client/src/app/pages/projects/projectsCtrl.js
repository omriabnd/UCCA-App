
(function () {
    'use strict';

    angular.module('zAdmin.pages.projects')
        .controller('ProjectsCtrl', ProjectsCtrl);

    /** @ngInject */
    function ProjectsCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, projectsService, TableStructure, Core,TableData) {

        var vm = this;
        vm.smartTableData = TableData;
        Core.init(vm,TableStructure,projectsService);

        vm.editRow = editRow;
        vm.myTasks = myTasks;

        function myTasks (obj,index){
            console.log("editRow",obj);
            $state.go('projectTasks',{id:obj.id,layerType:obj.layer.type})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.projects',{id:obj.id})
        }

    }

})();
