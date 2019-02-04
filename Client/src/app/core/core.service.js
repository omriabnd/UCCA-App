
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.core')
      .service('Core', Core);

	/** @ngInject */
	function Core($rootScope,$uibModal,$timeout,PermPermissionStore,PermRoleStore,storageService, toastr) {
        
        $rootScope.lastScrollPosMain = 0;
        
		var core = {
			init: init,
			showMore: showMore,
			showMoreWithoutJson: showMoreWithoutJson,
			goNext: goNext,
			search: search,
			removeRow: removeRow,
			extractDataFromStructure: extractDataFromStructure,
			checkForPagePermissions: checkForPagePermissions,
			findItemInArrayById:findItemInArrayById,
			findItemPositionInArrayById:findItemPositionInArrayById,
			tablePageSize: 10,
			user_role: storageService.getObjectFromLocalStorage('user_role') || {"id":"4","Name":"Guest"},
			smartTableCanUseAction:smartTableCanUseAction,
			checkDependenciesKeys: checkDependenciesKeys,
			showNotification: showNotification,
			validate: validate,
			intersectArrays: intersectArrays,
			hasValue: hasValue,
			previewTask: previewTask,
			showAlert: showAlert,
			exportAsset: exportAsset,
			initCategoriesStringToArray: initCategoriesStringToArray,
			generateRestrictionObject: generateRestrictionObject,
			parseSmartTableColumnData:parseSmartTableColumnData,
			viewOnlyRuleOk:viewOnlyRuleOk,
			promptAlert:promptAlert,
                    isEmptyObject:isEmptyObject,
                    scrollToUnit:scrollToUnit,
                    scrollToTop:scrollToTop,
                    openAllUnits:openAllUnits
		};
		
		return core;
        
        function openAllUnits(annotationUnit) {
            console.log(annotationUnit);
            
            annotationUnit.gui_status = "OPEN";
            
            if(annotationUnit.AnnotationUnits === undefined){
            	return;
            }
            if(annotationUnit.AnnotationUnits.length == 0){
               return;
            }
            
            for(var i=0; i<annotationUnit.AnnotationUnits.length; i++){
                openAllUnits(annotationUnit.AnnotationUnits[i]);
            }
            return annotationUnit;
        }

        function scrollToTop() {
        	$timeout(function(){
        		$rootScope.lastScrollPosMain = 0;
        		//$('html, body').scrollTop(0);
				$('.main-body').scrollTop(0);
        	});
        }
            
        function scrollToUnit(unitID) {
            $timeout(function(){
                try{
                    if($('#unit-'+unitID).offset() !== undefined){
                       //
                       // var rel_position = 0;
                       // var parent = $('#unit-'+unitID);
                       // while (parent && !parent.hasClass('main-body')) {
                       //     rel_position += parent.position().top;
                       //     parent = parent.offsetParent();
                       //     console.log(parent);
                       // }
                       // console.log(rel_position);
                       var newOffset = $('#unit-'+unitID).offset().top - $('.main-body').offset().top + $('.main-body').scrollTop()
                           - $('.main-body').height() * 0.3;
                        if ($rootScope.lastScrollPosMain >= 0 && Math.abs(newOffset - $rootScope.lastScrollPosMain) < 10) {
                                newOffset = $rootScope.lastScrollPosMain;
                        }
                        else {
                                $rootScope.lastScrollPosMain = newOffset;
                        }
						$('.main-body').scrollTop(newOffset);
                        //$('html, body').scrollTop(newOffset);
                    }                    
                }catch(e){
                    console.log("Scroll to unit failed : ", e);
                }
                
            });            
        }

        function isEmptyObject(obj) {
            for(var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        }

		function viewOnlyRuleOk(_viewOnlyRule){
		    var isOk = false;
		    var viewOnlyRule = _viewOnlyRule || this;
		    if(viewOnlyRule){
		        switch(viewOnlyRule.validateFunction){
		            case "hasValue":
		                isOk = checkIfHasValueInAssetKey(viewOnlyRule.key)
		                break;
		        }
		    }
		    return isOk;
		}
		
		function checkIfHasValueInAssetKey(assetKey){
			if(core.currentService && core.currentService.Data){
			    if(angular.isArray(core.currentService.Data[assetKey])){
			        return core.currentService.Data[assetKey].length > 0
			    }
			    return !!core.currentService.Data[assetKey] 
			}
			return false;
		}

		function parseSmartTableColumnData(itemRow,value){
			if(itemRow[value['key']]){
				if(angular.isArray(itemRow[value['key']])){
					return itemRow[value['key']].map(function(obj){
						if(obj.name){
							return obj.name+"("+obj.id+")"
						}else if(obj.short_text){
							return obj.short_text+"("+obj.id+")"
						}else{
							return obj.id
						}
					}).toString().split(",").join(", ")
				}else{
					return (itemRow[value['key']].name || itemRow[value['key']].short_text || itemRow[value['key']].id || itemRow[value['key']] )
				}
			}else{
				return "";
			}
		}

		function generateRestrictionObject(categoryOneArray,restrictionType,categoryTwoArray){
		    categoryOneArray = categoryOneArray.map(function(cat){
		        delete cat.description;
		        delete cat.tooltip;
		        return cat;
		    })
		    categoryTwoArray = categoryTwoArray.map(function(cat){
		        delete cat.description;
		        delete cat.tooltip;
		        return cat;
		    })
		    return {
		        categories_1: categoryOneArray,
		        type:restrictionType.key,
		        categories_2: categoryTwoArray
		    }
		}

		function initCategoriesStringToArray(categoriesAsString){
		    return JSON.parse(categoriesAsString.replace(/'/g,'"').replace(/True/g,'true').replace(/False/g,'false').replace(/None/g,'null'))
		}

		function exportAsset(){
			var asset = angular.copy(this.currentService.Data, asset)
			asset.description = fetchDescription(asset.description);
			this.showMore(asset);
		}

		function fetchDescription(desc){
			if(!!desc){
				if(!!$(desc).text()){
					return $(desc).text()
				}else if(!!desc){
					return desc
				}else{
					return "Asset as JSON"
				}
			}
			return "Asset as JSON"
		}

		function smartTableCanUseAction(functionName,onlyForRoles){
		  /*
		    logic wehn to show the button
		  */
		  var permitted = true;
		  if(!!onlyForRoles && onlyForRoles.length){
		    permitted = (onlyForRoles.indexOf(core.user_role.name.toUpperCase()) > -1)
		  }
        
		  return permitted;
		}

		function goNext(currentPage) {
			var tableScope = angular.element($('div[st-pagination]')).isolateScope();
			if (tableScope.currentPage == tableScope.numPages) {
				var vm = this;
				vm.currentService.getTableData([{'searchKey':'offset','searchValue': vm.smartTableDataSafe.length}]).then(function (res) {
					vm.smartTableDataSafe = vm.smartTableDataSafe.concat(res);
					$timeout(function(){
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

		function showMoreWithoutJson(obj, pagelink, size) {
			this.showMore(obj, pagelink, size, true);
		}

		function showMore(obj, pagelink, size, hideJson) {
			var pagelink = angular.isString(pagelink) ? pagelink || 'app/pages/ui/modals/modalTemplates/largeModal.html' : 'app/pages/ui/modals/modalTemplates/largeModal.html';
			var size = size || 'lg';
			$uibModal.open({
				animation: true,
				templateUrl: pagelink,
				size: size,
				scope: $rootScope.$new(),
				controller: ["$scope","$sce",function ($scope,$sce) {
					$scope.htmlContent = obj.htmlContent;
					$scope.name = obj.name;
					if(obj.description){
					    $scope.description = $sce.trustAsHtml(obj.description);
					}
					if(!hideJson){
						$scope.jsonString = JSON.stringify(obj);
					}
				}]
			});
		};

		function promptAlert(message) {
			var pagelink = 'app/pages/ui/modals/modalTemplates/dangerModal.html';
			var size = 'md';
			return $uibModal.open({
				animation: true,
				templateUrl: pagelink,
				size: size,
				scope: $rootScope.$new(),
				controller: ["$scope",function ($scope) {
					$scope.message = message
				}]
			});
		}

		function extractDataFromStructure(structure) {
			var result = {};
			for (var i = 0; i < structure.length; i++) {
				if(structure[i].shouldSendToServer != false){
					structure[i].type == "checkbox" ? result[structure[i].key] = !!structure[i].value : result[structure[i].key] = structure[i].value || null;
				}
			}
			return result;
		}

		function searchBy(structure) {
			var searchBy = structure.map(function (structureObj) {
				return {
					"searchKey": structureObj.key,
					"searchValue": typeof structureObj.value == 'object' ? structureObj.value.label : structureObj.type == 'checkbox' ? !!structureObj.value : structureObj.value
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
			$rootScope.$pageFinishedLoading = false;
			core.currentService.getTableData(searchTerms).then(searchSuccess, searchFailed);
		}

		function searchSuccess(res) {
			core.currentCtrl.smartTableDataSafe = res;
			$rootScope.$pageFinishedLoading = true;
			core.currentCtrl.$totalResults = $rootScope.$totalResults;
		}

		function searchFailed(err) {
			console.log("searchFailed err :", err);
			$rootScope.$pageFinishedLoading = true;
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
				if(!!rowElement.validationRule && rowElement.validationRule.type == "Require" && rowElement.value == ""){
					_core.showNotification('error',"Field "+rowElement.name+" is required.");
					result = false;
				}
			});
			return result;
		}

		/**
		 * Returns the intersection of two arrays (not necessarily sorted)
         * @param A1
         * @param A2
         */
		function intersectArrays(A1,A2) {
			var output = new Array();
			for (var i=0; i < A1.length; i++) {
				if (A2.indexOf(A1[i]) >= 0) {
					output.push(A1[i]);
				}
			}
			return output;
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
				
				vm.viewOnlyRuleOk = core.viewOnlyRuleOk;

				vm.showMoreWithoutJson = core.showMoreWithoutJson;

				vm.parseSmartTableColumnData = core.parseSmartTableColumnData;
				
				vm.removeRow = core.removeRow;

				vm.goNext = core.goNext;
				
				vm.search = core.search;
				
				vm.exportAsset = core.exportAsset;

				vm.smartTablePageSize = core.tablePageSize;

				vm.smartTableDataSafe = [].concat(vm.smartTableData)
				
				vm.$totalResults = $rootScope.$totalResults;
				
				vm.smartTableCanUseAction = core.smartTableCanUseAction

				setTableVisibleFields(vm, smartTableStructure);
			}
			return vm;
		}
	}

})();
