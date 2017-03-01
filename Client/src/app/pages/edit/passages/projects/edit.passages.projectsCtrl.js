
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.passages.projects')
        .controller('EditPassagesProjectsCtrl', EditPassagesProjectsCtrl);

    /** @ngInject */
    function EditPassagesProjectsCtrl($scope, $state, Core, TableData, TableStructure) {
        var vm = this;
        vm.back= back;

        vm.smartTableData = TableData;
        Core.init(this,TableStructure);

        function back(){
            $state.go('edit.passages');
        }

    }

})();
