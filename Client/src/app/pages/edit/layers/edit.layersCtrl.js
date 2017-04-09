
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.pages.edit.layers')
      .controller('EditLayerCtrl', EditLayerCtrl);

  /** @ngInject */
  function EditLayerCtrl($scope, $rootScope, $filter,$state, editableOptions, editableThemes, $uibModal,Core) {
  	var vm = this;
  	vm.back = back;
    
    vm.chooseRow = chooseRow;

    function chooseRow(obj,index,currentService,ctrlToRefresh){
        console.log("chooseRow "+index,obj);
        var LayerDetails = {
            "id":obj.id,
            "name":obj.name,
            "shortcut_key": obj.shortcut_key,
            "abbreviation":obj.abbreviation

        };
        if( currentService.get('type')=="EXTENSION" ){
            var parentLayer = currentService.get('parent');
            if(parentLayer[0]){
                var itemNotAlreadyInParentLayer = Core.findItemInArrayById(LayerDetails.id,parentLayer[0].categories);
                if(itemNotAlreadyInParentLayer == false){ // item is Already In Parent Layer
                    Core.showNotification('error','Cant add this category. It is already located in the parent layer.')
                    return;
                }
            }else{
                Core.showNotification('error','Extension layer must have a parent layer.')
                return;
            }
        }
        var itemAlreadySelected = Core.findItemInArrayById(LayerDetails.id,currentService.get('categories'));
        if(itemAlreadySelected){
            promptHotKeySelectionModal(obj,LayerDetails,ctrlToRefresh,currentService);
        }else{
            Core.showNotification('error','Category already exists.')
            return;
        }
    }

    function promptHotKeySelectionModal(obj,LayerDetails,ctrlToRefresh,currentService){
        $uibModal.open({
            animation: true,
            templateUrl: 'app/pages/edit/layers/select.hotkey.modal.html',
            size: 'md',
            resolve: {
                items: function () {
                    return $scope.items;
                }
            },
            controller: function($scope, $uibModalInstance) {
                $scope.categoryHotKey = null;

                $scope.save = function() {
                    if($scope.categoryHotKey != null && $scope.categoryHotKey != ''){
                        obj.selected = true;
                    }
                    LayerDetails.shortcut_key = $scope.categoryHotKey;
                    currentService.set("categories",LayerDetails);
                    ctrlToRefresh.refreshData("categories");
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });
    }

    function back(){
      history.back();
    }

  }

})();