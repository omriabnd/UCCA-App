/**
 * Animated load block
 */
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.theme')
        .directive('smartInnerTable', smartInnerTable);

    /** @ngInject */
    function smartInnerTable($timeout, $rootScope) {
        return {
            restrict: 'E',
            templateUrl:'app/pages/tables/widgets/smartInnerTable.html',
            controller: innerTableCtrl,
            controllerAs:'vm',
            scope:{
                tableData:'=',
                pageName:'=',
                ctrlModule:'=',
                viewOnly:'=',
                categoryName:'@',
                managePageRoute:'=',
                loadSelectDataStructure:'=',
                isSortable:'='
                
            },
            link: function (scope, elem) {
                scope.$watch('tableData', function() {
                    scope.vm.smartTableData = [];
                    angular.isArray(scope.tableData) ? scope.vm.smartTableData = scope.tableData : scope.vm.smartTableData.push(scope.tableData);
                });
            }
        };
    }
    /** @ngInject */
    function innerTableCtrl($scope, $state,$rootScope,apiService) {

        var vm = this;

        vm.manage = manage;
        vm.edit = goToEditPageThroughParentCtrl;
        vm.toggleItem = toggleItem;
        vm.removeRow = removeRow;

        $scope.ctrlModule.smartTableStructure.forEach(function(tableRow){
            if(tableRow.key == $scope.pageName){
                vm.smartTableStructure = tableRow.tableStructure;
            }
        })

        if (vm.smartTableStructure == undefined) vm.smartTableStructure = $scope.ctrlModule.smartTableStructure;

        $scope.vm.smartTableData = [];
        angular.isArray($scope.tableData) ? $scope.vm.smartTableData = $scope.tableData : $scope.vm.smartTableData.push($scope.tableData);

        function manage(){
            $scope.ctrlModule.manage($scope.managePageRoute);
        }

        function goToEditPageThroughParentCtrl(obj,index){
            $scope.ctrlModule.edit($scope.managePageRoute,true,obj,index,$scope.vm.smartTableData[index]);
        }

        function removeRow(obj, index){
            $scope.ctrlModule.deleteItemInData($scope.pageName,index)
            $scope.ctrlModule.refreshData($scope.pageName);
        }

        function toggleItem(category,categoryValue){
            try{
                $scope.ctrlModule.toggleItem($scope.categoryName,category,categoryValue);
            }catch(e){
                console.log(e)
            }
            
           
        }




    }


})();