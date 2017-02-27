
(function () {
  'use strict';

  angular.module('zAdmin.core')
      .service('Core', Core);

	/** @ngInject */
	function Core($rootScope,$uibModal,$timeout,PermPermissionStore,PermRoleStore,storageService, toastr) {

		var core = {
			init: init,
			showMore: showMore,
			goNext: goNext,
			search: search,
			removeRow: removeRow,
			extractDataFromStructure: extractDataFromStructure,
			checkForPagePermissions: checkForPagePermissions,
			findItemInArrayById:findItemInArrayById,
			findItemPositionInArrayById:findItemPositionInArrayById,
			tablePageSize: 5,
			user_role: storageService.getObjectFromLocalStorage('user_role') || {"id":"4","Name":"Guest"},
			smartTableCanUseAction:smartTableCanUseAction,
			checkDependenciesKeys: checkDependenciesKeys,
			showNotification: showNotification,
			validate: validate,
			hasValue: hasValue,
			previewTask: previewTask,
			showAlert: showAlert
		};
		
		return core;


		function smartTableCanUseAction(functionName,onlyForRoles,type){
			return true
		}
		function goNext(currentPage) {
			var tableScope = angular.element($('div[st-pagination]')).isolateScope();
			if (tableScope.currentPage == tableScope.numPages) {
				var vm = this;
				vm.currentService.getTableData([{'searchKey':'offset','searchValue': vm.smartTableDataSafe.length}]).then(function (res) {
					vm.smartTableDataSafe = vm.smartTableDataSafe.concat(res);
					$timeout(function () {
						tableScope.selectPage(currentPage + 1);
					})
				});
			} else {
				tableScope.selectPage(currentPage + 1);
			}
		};

		function previewTask (obj,index){

		  switch(obj.type){
		    case 'TOKENIZATION':
		      openInNewTab('#/tokenizationPage/'+obj.id)
		      break;
		    default:
		      openInNewTab('#/annotationPage/'+obj.id)
		      break;
		  }
		}

		function openInNewTab(url) {
		  var win = window.open(url, '_blank');
		  win.focus();
		}
		
		function checkForPagePermissions(state_id) {
			return PermPermissionStore.getStore()[state_id.toString()].validationFunction[2](state_id.toString());
		}

		function showMore(obj, pagelink, size) {
			var pagelink = angular.isString(pagelink) ? pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html' : 'app/pages/ui/modals/modalTemplates/largeModal.html';
			var size = size || 'lg';
			$uibModal.open({
				animation: true,
				templateUrl: pagelink,
				size: size,
				scope: $rootScope.$new(),
				controller: function ($scope) {
					$scope.htmlContent = obj.htmlContent;
					$scope.name = obj.name;
					$scope.description = obj.description;
					$scope.jsonString = JSON.stringify(obj);
				}
			});
		};

		function extractDataFromStructure(structure) {
			var result = {};
			for (var i = 0; i < structure.length; i++) {
				if(structure[i].shouldSendToServer != false){
					structure[i].type == "checkbox" ? result[structure[i].key] = structure[i].value : result[structure[i].key] = structure[i].value || null;
				}
			}
			return result;
		}

		function searchBy(structure) {
			var searchBy = structure.map(function (structureObj) {
				return {
					"searchKey": structureObj.key,
					"searchValue": structureObj.value
				}
			}).filter(function (searchObj) {
				searchObj.searchValue = searchObj.searchValue && searchObj.searchValue.value ? searchObj.searchValue.value : searchObj.searchValue;
				return searchObj.searchValue !== undefined && searchObj.searchValue.toString().length;
			});
			return searchBy;
		}

		function search(structure) {
			console.log("searchBy", searchBy(structure));
			var searchTerms = searchBy(structure);
			core.currentService.getTableData(searchTerms).then(searchSuccess, searchFailed);
		}

		function searchSuccess(res) {
			core.currentCtrl.smartTableDataSafe = res;
		}

		function searchFailed(err) {
			console.log("removeCategoryFailed err :", err);
		}

		function autoExecute() {
			// call it from controller this way: vm.autoExecute = Core.autoExecute.apply(this,vm.smartTableStructure);
			var vm = this;
			var args = Array.prototype.slice.call(arguments);
			args.filter(function (item, index) {
				if (item.autoExecute) {
					console.log("item", item);
					vm[item.functionName]();
				}
			})
		}

		function removeRow(obj,index){
			var vm = this;
			console.log("removeRow "+index,obj);
			vm.currentService.delete(obj.id).then(removeSuccess.bind(obj),removeFailed);
		}

		function removeSuccess(res) {
			core.currentCtrl.removeRowWithObj = this;
			// core.currentCtrl.smartTableDataSafe.splice(core.currentCtrl.removeRowIndex, 1);
			core.currentCtrl.smartTableDataSafe = core.currentCtrl.smartTableDataSafe.filter(function(obj){
				return obj.id != core.currentCtrl.removeRowWithObj.id
			})
			delete core.currentCtrl.removeRowWithObj;
			core.showNotification('success','Remove Success');
		}

		function removeFailed(err) {
			console.log('removeFailed',err);
		}

		function findItemInArrayById(idToLookFor,arrayToLookIn){
			var searchResults = arrayToLookIn.filter(function(obj){
				if(obj.id == idToLookFor){
					return obj;
				}
			});
			return searchResults.length == 0;
		}

		function findItemPositionInArrayById(idToLookFor,arrayToLookIn){
			var result = -1;
			for(var i=0; i<arrayToLookIn.length; i++){
				if(idToLookFor == arrayToLookIn[i].id){
					result = i;
				}
			}
			return result;
		}

		function setTableVisibleFields(vm,TableStructure){
		  for(var i=0; i<TableStructure.length; i++){
		    TableStructure[i].showInTable ? vm.tableVisibleFields[TableStructure[i].key] = true : vm.tableVisibleFields[TableStructure[i].key] = false;
		  }
		}

		function checkDependenciesKeys(dependenciesKeys,smartTableStructure){
			var result = -1;
			dependenciesKeys.forEach(function(object,index){
				smartTableStructure.forEach(function(tableRow){
					if(tableRow.key == object.key && tableRow.value == ""){
						result = index;
					}
				});
			});
			return result;
		}

		function showNotification(notificationType,textToShow){
			var titles = {
				error:'Pay Attention!!!',
				success: 'Well Done'
			};
			toastr[notificationType](textToShow, titles[notificationType], {
                    "autoDismiss": false,
                    "positionClass": "toast-top-right",
                    "type": notificationType,
                    "timeOut": "5000",
                    "extendedTimeOut": "2000",
                    "allowHtml": false,
                    "closeButton": false,
                    "tapToDismiss": true,
                    "progressBar": false,
                    "newestOnTop": true,
                    "maxOpened": 0,
                    "preventDuplicates": false,
                    "preventOpenDuplicates": false
                })
		}

		function showAlert(message) {
		    $uibModal.open({
		        animation: true,
		        templateUrl: 'app/pages/annotation/templates/errorModal.html',
		        size: 'sm',
		        controller: function($scope){
		            $scope.message = message;
		        }
		    });
		};

		function validate(structureToValidate){
			var _core = this;
			var result = true;
			structureToValidate.forEach(function(rowElement){
				if(rowElement.validationRule.type == "Require" && rowElement.value == ""){
					_core.showNotification('error',"Field "+rowElement.name+" is required.");
					result = false;
				}
			});
			return result;
		}

		function hasValue(obj){
			if(obj == ""){
				return false;
			}
			return true;
		}

		function init(vm, smartTableStructure, currentService) {
			storageService.deleteFromLocalStorage("shouldEditLayer");
			if (!!vm) {

				if (!!smartTableStructure) {

					vm.smartTableStructure = smartTableStructure;

					vm.smartTableStructure.filter(function (item, index) {
						if (item.autoExecute) {
							console.log("excecute item", item);
							vm[item.functionName]();
						}
					});
				}

				vm.currentService = currentService;
				
				core.currentService = currentService;
				core.currentCtrl = vm;

			    vm.tableVisibleFields = {};

				vm.showMore = core.showMore;
				
				vm.removeRow = core.removeRow;

				vm.goNext = core.goNext;
				
				vm.search = core.search;

				vm.smartTablePageSize = core.tablePageSize;

				vm.smartTableDataSafe = [].concat(vm.smartTableData)

				vm.smartTableCanUseAction = core.smartTableCanUseAction

				setTableVisibleFields(vm, smartTableStructure);
			}
			return vm;
		}
	}

})();
