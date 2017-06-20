(function() {
    'use strict';

    angular.module('zAdmin.annotation.directives')
        .directive('annotationToken',annotationTokenDirective);

    /** @ngInject */
    function annotationTokenDirective($rootScope,selectionHandlerService,HotKeysManager,DataService) {

        var directive = {
            restrict:'E',
            templateUrl:'app/pages/annotation/directives/token/token.html',
            scope:{
                token:"=",
                parentId:"@"
            },
            link: annotationTokenDirectiveLink,
            controller: AnnotationTokenController,
            controllerAs: 'dirCtrl',
            bindToController: true,
            replace:true,
            tokenClicked: false

        };

        return directive;

        function annotationTokenDirectiveLink($scope, elem, attrs) {
            $scope.vm = $scope.dirCtrl;
            $scope.vm.token['indexInParent'] = !$scope.vm.token['indexInParent'] ? $scope.$parent.$index : $scope.vm.token['indexInParent'];
            $scope.vm.tokenInSelectionList = tokenInSelectionList;

            $scope.$on('tokenIsClicked', function(event, args) {
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                var shiftPressed = HotKeysManager.checkIfHotKeyIsPressed('shift');

                if(args.token.id !== $scope.vm.token.id ){
                    !ctrlPressed ? $scope.vm.tokenIsClicked = false : '';
                }else if(args.parentId !== undefined && (args.parentId.toString() ===  $scope.vm.parentId )){
                    !ctrlPressed && !shiftPressed && !args.selectAllTokenInUnit ? selectionHandlerService.clearTokenList() : '';
                    selectionHandlerService.addTokenToList($scope.vm.token,$scope.vm.parentId,args.selectAllTokenInUnit);
                    // $scope.vm.tokenIsClicked = true;
                }
            });

        }




        function AnnotationTokenController() {
            var vm = this;
            vm.token['inUnit'] === undefined ? vm.token['inUnit'] = null : '';
            vm.tokenIsClicked = directive.tokenClicked;
            vm.tokenClicked = tokenClicked;
            vm.isUnitClicked = isUnitClicked;
            vm.addOnHover = addOnHover;
            vm.tokenDbClick = tokenDbClick;
            vm.tokenUnitIsSelected = tokenUnitIsSelected;
            vm.initToken = initToken;
        }

        function tokenDbClick(vm){
            selectionHandlerService.clearTokenList();
            if(vm.token.inUnit !== null && vm.token.inUnit !== undefined){
                DataService.getUnitById(vm.token.inUnit).gui_status = "OPEN";
                DataService.getUnitById(DataService.getParentUnitId(vm.token.inUnit)).gui_status = "OPEN";
                selectionHandlerService.updateSelectedUnit(vm.token.inUnit);

                var container = $('html, body'),
                    scrollTo = $('#unit-'+vm.token.inUnit);

                // Or you can animate the scrolling:
                container.animate({
                    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - 100
                },1000, "linear");
            }

        }

        function isUnitClicked(vm,index){
            vm.token.parentId === undefined ?  vm.token.parentId = "0": '';
            return selectionHandlerService.getSelectedUnitId() === vm.token.parentId && getUnitCursorLocation(vm.token) === index.toString();
        }

        function getUnitCursorLocation(token){
            var parentUnit = DataService.getUnitById(token.parentId);
            return parentUnit.cursorLocation.toString();
        }

        function addOnHover(vm){

            if(HotKeysManager.checkIfHotKeyIsPressed('shift')){
                var selectedTokenList = selectionHandlerService.getSelectedTokenList();
                var lastSelectedToken = selectedTokenList[selectedTokenList.length - 1];
                if(lastSelectedToken !== undefined && lastSelectedToken['indexInParent'] + 1 !== vm.token['indexInParent']){
                    var parentUnit = DataService.getUnitById(vm.token.parentId);
                    if(lastSelectedToken['indexInParent'] < vm.token['indexInParent']){
                        // selectionHandlerService.clearTokenList();
                        for(var i= lastSelectedToken['indexInParent']+1; i<vm.token['indexInParent']+1; i++){
                            if(parentUnit.tokens[i].parentId === undefined){
                                parentUnit.tokens[i]['parentId'] = "0";
                            }
                            if(tokenInSelectionList({token:parentUnit.tokens[i]})){
                                selectionHandlerService.removeTokenFromList(parentUnit.tokens[i].id);
                            }else if(parentUnit.tokens[i].parentId){
                                $rootScope.$broadcast('tokenIsClicked', {
                                    token: parentUnit.tokens[i],
                                    parentId: parentUnit.tokens[i].parentId,
                                    selectAllTokenInUnit: false
                                });
                            }
                        }
                    }else{
                        selectionHandlerService.clearTokenList();
                        for(var k=0,i = lastSelectedToken['indexInParent']; i>vm.token['indexInParent']; i--,k++){
                            if(parentUnit.tokens[i].parentId === undefined){
                                parentUnit.tokens[i]['parentId'] = "0";
                            }
                            if(tokenInSelectionList({token:parentUnit.tokens[i]})){
                                selectionHandlerService.removeTokenFromList(parentUnit.tokens[i].id);
                            }else if(parentUnit.tokens[i].parentId){
                                $rootScope.$broadcast('tokenIsClicked',{
                                    token: parentUnit.tokens[i],
                                    parentId: parentUnit.tokens[i].parentId,
                                    selectAllTokenInUnit: false
                                });
                            }
                        }
                    }

                }
                tokenClicked(vm);
            }
        }

        function initToken(vm,index){
            console.log(index)
        }

        function tokenClicked(vm){
            directive.tokenClicked = !directive.tokenClicked;
            vm.tokenIsClicked = !vm.tokenIsClicked;
            selectionHandlerService.setTokenClicked();

            var tokenInUnit = DataService.getUnitById(vm.token.inUnit);
            if(vm.token.inUnit !== null && tokenInUnit){
                var ctrlPressed = HotKeysManager.checkIfHotKeyIsPressed('ctrl');
                !ctrlPressed ? selectionHandlerService.clearTokenList() : '';
                var parentUnit = DataService.getUnitById(vm.token.parentId);
                var tokenGroup = parentUnit.tokens.filter(function(x) {return x.inUnit === vm.token.inUnit; });

                tokenGroup.forEach(function(token){
                    $rootScope.$broadcast('tokenIsClicked',{token: token, parentId: token.parentId,selectAllTokenInUnit: true});
                })
            }else{
                $rootScope.$broadcast('tokenIsClicked',{token: vm.token, parentId: vm.parentId, selectAllTokenInUnit: false});
            }
        }

        function tokenUnitIsSelected(vm){
            if(!vm.token.parentId){
                vm.token.parentId = "0";
            }
            return selectionHandlerService.getSelectedUnitId() === vm.token.parentId;
        }

        function tokenInSelectionList(vm){
            var selectionList = selectionHandlerService.selectedTokenList;
            var elementPos = selectionList.map(function(x) {return x.id; }).indexOf(vm.token.id);
            return elementPos > -1;
        }


    }

})();/**
 * Created by Nissan PC on 05/06/2017.
 */
