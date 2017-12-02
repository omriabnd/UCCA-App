
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.pages.edit.passages.texts')
        .controller('EditPassagesTasksCtrl', EditPassagesTasksCtrl);

    /** @ngInject */
    function EditPassagesTasksCtrl($scope, $state, Core, TableData, TableStructure) {
        var vm = this;
        vm.back= back;

        vm.smartTableData = TableData;
        Core.init(this,TableStructure);

        function back(){
            $state.go('edit.passages');
        }

    }

})();
