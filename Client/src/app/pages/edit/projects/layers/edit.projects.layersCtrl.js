
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.projects.layers')
        .controller('EditProjectsLayersCtrl', EditProjectsLayersCtrl);

    /** @ngInject */
    function EditProjectsLayersCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal, EditTableStructure, editProjectsService, editProjectLayerService, Core, LayersTableData) {
        var vm = this;
        vm.edit = edit;
        vm.editRow = editRow;
        vm.chooseRow = chooseRow;
        vm.newSource = newSource;

        var parentCtrl = $scope.$parent.vm;

        vm.smartTableData = LayersTableData;
        Core.init(this,EditTableStructure,editProjectLayerService);



        function newSource (obj,index){
            console.log("editRow",obj);
            $state.go('edit.projects.layers.create',{})
            // $state.go('edit.projects.texts',{})
        }

        function editRow (obj,index){
            console.log("editRow",obj);
            $state.go('edit.layers',{id:obj.id})
        }

        function chooseRow(obj,index){
            console.log("chooseRow "+index,obj);
            var layerDetails = {
                "id":obj.id,
                "name":obj.name,
                "type":obj.type
            }
            var replaceInArray = true;
            editProjectsService.set("layer",obj,replaceInArray);
            parentCtrl.refreshData("layer");
        }

        function edit(obj){
            console.log("edit",obj);
        }
    }

})();
