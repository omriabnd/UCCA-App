/**
 * Auto expand textarea field
 */
(function () {
    'use strict';

    angular.module('zAdmin.theme')
        .directive('htmlStringToContent', htmlStringToContent);

    /** @ngInject */
    function htmlStringToContent(Core,$sce) {
        return {
            restrict: 'A',
            'scope':{
              'elemValue':'='
            },
            link: function ($scope, elem) {
                var htmlRegExp = /<[a-z][\s\S]*>/i;
                var stringToCheck = $scope.elemValue;
                if(htmlRegExp.test(stringToCheck)){
                    var htmlElements = $.parseHTML( stringToCheck );
                    $scope.dataAsHtml = $('<div></div>').append(htmlElements);
                    $scope.thisCanBeusedInsideNgBindHtml = $sce.trustAsHtml(stringToCheck);
                    $scope.elemValue = $scope.dataAsHtml[0].innerText;
                    $(elem).addClass('table-object');
                    $(elem).on('click',function(){
                        var objectToDisplay = {'name':'Project description','htmlContent':$scope.thisCanBeusedInsideNgBindHtml};
                        var pageLink = 'app/pages/ui/modals/modalTemplates/htmlContentModal.html';
                        Core.showMore(objectToDisplay, pageLink)
                    })
                }
            }
        };
    }

})();