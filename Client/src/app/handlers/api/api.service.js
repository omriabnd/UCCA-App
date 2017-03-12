
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
	'use strict';

	angular.module('zAdmin.api')
		.service('apiService', apiService);

	/** @ngInject */
	function apiService($rootScope,$http,$q,$timeout,httpService,storageService,Core) {
		var api = {
			isLoggedIn: function(){
				return storageService.getFromLocalStorage('isLoggedIn');
			},
			logout: function(){
				return httpService.postRequest('logout').then(function(res){
					return res
				}).then(function(){
					storageService.clearLocalStorage();
				},function(){
					storageService.clearLocalStorage();
				});
			},
			login: function(doLogin){
				return httpService.postRequest('login',doLogin).then(function(res){
					if(!res.data.error){
						storageService.saveObjectInLocalStorage('UserInfo',res.data)
						return res;
					}else{
						$rootScope.$pageFinishedLoading = true;
						Core.showNotification('info',res.data.error)
						throw res.data.error
					}
				});
			},
			registerNewUser: function(new_user_object){
				return httpService.postRequest('signup/',new_user_object);
			},
			forgotPassword: function(email){
				return httpService.postRequest('forgot_password',email);
			},
			tokenization:{
				getTaskData: function(task_id){
					return httpService.getRequest('user_tasks/'+task_id);
				},
				getPassageData: function(passage_id){
					return httpService.getRequest('passages',passage_id);
				},
				putTaskData: function(taskData){
					return httpService.getRequest('tasks/'+taskData.id,taskData);
				}
			},
			annotation:{
				getTaskData: function(task_id){
					return httpService.getRequest('user_tasks/'+task_id);
				},
				putTaskData: function(mode,taskData){
					return httpService.putRequest('user_tasks/'+taskData.id+'/'+mode,taskData);
				},
				getCategories: function(){
					return httpService.getRequest('categories');
				},
				getProjectLayer:function(layer_id){
					return httpService.getRequest('layers/'+layer_id);
				}
			},
			profile:{
				getProfileData: function(user_id){
					return httpService.getRequest('users/'+user_id);
				},
				putProfileData: function(profileDetails){
					return httpService.putRequest('users/'+profileDetails.id+'/',profileDetails);
				},
				postUserPassword: function(passwordDetails){
					return httpService.postRequest('change_password',passwordDetails);
				}
			},
			users: {
				getUserTableStructure: function(){
					return httpService.getRequest('../app/pages/users/users.table.structure.json',{},true,true);
				},
				getUsersTableData: function(searchTerms){
					return httpService.getRequest('users',searchTerms);
				},
				deleteUser: function(user_id){
					return httpService.deleteRequest('users/',user_id);
				}
			},
			projects: {
				getProjectTableStructure: function(){
					return httpService.getRequest('../app/pages/projects/projects.table.structure.json',{},true,true);
				},
				getProjectsTableData: function(searchTerms){
					return httpService.getRequest('projects',searchTerms);
				},
				deleteProject: function(project_id){
					return httpService.deleteRequest('projects/',project_id);
				}
			},
			sources: {
				getSourceTableStructure: function(){
					return httpService.getRequest('../app/pages/sources/sources.table.structure.json',{},true,true);
				},
				getSourcesTableData: function(searchTerms){
					return httpService.getRequest('sources',searchTerms);
				},
				deleteSource: function(source_id){
					return httpService.deleteRequest('sources/',source_id);
				}
			},
			layers: {
				getLayersTableStructure: function(){
					return httpService.getRequest('../app/pages/layers/layers.table.structure.json',{},true,true);
				},
				getLayersTableData: function(searchTerms){
					return httpService.getRequest('layers',searchTerms);
				},
				deleteLayer: function(layer_id){
					return httpService.deleteRequest('layers/',layer_id);
				}
			},
			tasks: {
				getTasksTableStructure: function(){
					return httpService.getRequest('../app/pages/tasks/tasks.table.structure.json',{},true,true);
				},
				getTasksTableData: function(searchTerms){
					return httpService.getRequest('tasks',searchTerms);
				},
				deleteTask: function(task_id){
					return httpService.deleteRequest('tasks/',task_id);
				}
			},
			categories: {
				getTableStructure: function(){
					return httpService.getRequest('../app/pages/categories/categories.structure.json',{},true,true);
				},
				getCategoriesTableData: function(searchTerms){
					return httpService.getRequest('categories',searchTerms);
				},
				deleteCategory: function(source_id){
					return httpService.deleteRequest('categories/',source_id);
				}
			},
			passages: {
				getPassageTableStructure: function(){
					return httpService.getRequest('../app/pages/passages/passages.table.structure.json',{},true,true);
				},
				getPassagesTableData: function(searchTerms){
					return httpService.getRequest('passages',searchTerms);
				},
				deletePassage: function(passage_id){
					return httpService.deleteRequest('passages/',passage_id);
				}
			},
			edit: {
				users:{
					getEditUserTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/users/edit.users.structure.json',{},true,true);
					},
					getUserData: function(user_id){
						return httpService.getRequest('users/'+user_id);
					},
					putUserData: function(user_details){
						return httpService.putRequest('users/'+user_details.id+'/',user_details);
					},
					postUserData: function(user_details){
						return httpService.postRequest('users/',user_details);
					}
				},
				projects:{
					getEditProjectTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/projects/edit.projects.structure.json',{},true,true);
					},
					getProjectData: function(project_id){
						return httpService.getRequest('projects/'+project_id);
					},
					putProjectData: function(project_details){
						return httpService.putRequest('projects/'+project_details.id+'/',project_details);
					},
					postProjectData: function(project_details){
						return httpService.postRequest('projects/',project_details);
					},
					layer: {
						getTableStructure: function () {
							return httpService.getRequest('../app/pages/edit/projects/layers/edit.projects.layers.structure.json', {}, true, true);
						},
						getSelectTableStructure: function () {
							return httpService.getRequest('../app/pages/edit/projects/layers/edit.projects.layers.select.structure.json', {}, true, true);
						},
						getLayersTableData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						}
					},
					tasks: {
						getTableStructure: function () {
							return httpService.getRequest('../app/pages/project_tasks/project.tasks.table.structure.json', {}, true, true);
						},
						getSelectTableStructure: function () {
							return httpService.getRequest('../app/pages/project_tasks/project.tasks.structure.json', {}, true, true);
						},
						getTasksTableData: function(project_id){
							return httpService.getRequest('tasks/',project_id);
						}
					}
				},
				categories:{
					getEditCategoryTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/categories/edit.categories.structure.json', {}, true, true);
					},
					getCategoryData: function(category_id){
						return httpService.getRequest('categories/'+category_id);
					},
					putCategoryData: function(category_details){
						return httpService.putRequest('categories/'+category_details.id+'/',category_details);
					},
					postCategoryData: function(category_details){
						return httpService.postRequest('categories/',category_details);
					}
				},
				sources:{
					getEditSourceTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/sources/edit.sources.structure.json',{},true,true);
					},
					getSourceData: function(source_id){
						return httpService.getRequest('sources/'+source_id);
					},
					putSourceData: function(source_details){
						return httpService.putRequest('sources/'+source_details.id+'/',source_details);
					},
					postSourceData: function(source_details){
						return httpService.postRequest('sources/',source_details);
					}
				},
				layers:{
					extension:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/layers/extension/edit.layers.extension.structure.json',{},true,true);
						},
						getCoarseningLayerTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/layers/extension/coarsening.table.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/extension/categories/edit.layers.extension.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/extension/categories/edit.layers.extension.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/extension/extension/edit.layers.extension.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/extension/restrictions/edit.layers.extension.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/extension/categories/edit.layers.extension.categories.select.structure.json',{},true,true);
							}
						}
					},
					coarsening:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/layers/coarsening/edit.layers.coarsening.table.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/coarsening/categories/edit.layers.coarsening.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							},
							getParentCategoriesTableData:function(searchTerms){
								return httpService.getRequest('layers',searchTerms);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/coarsening/restrictions/edit.layers.coarsening.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/coarsening/restrictions/edit.layers.coarsening.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/categories/edit.layers.coarsening.categories.select.structure.json',{},true,true);
							}
						}
					},
					refinement:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/layers/refinement/edit.layers.refinement.table.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/refinement/categories/edit.layers.refinement.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							},
							getParentCategoriesTableData:function(searchTerms){
								return httpService.getRequest('layers',searchTerms);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/refinement/restrictions/edit.layers.refinement.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/categories/edit.layers.refinement.categories.select.structure.json',{},true,true);
							}
						}
					},
					root:{
						getEditLayerTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/layers/root/edit.layers.root.structure.json',{},true,true);
						},
						getLayerData: function(layer_id){
							return httpService.getRequest('layers/'+layer_id);
						},
						putLayerData: function(layer_details){
							return httpService.putRequest('layers/'+layer_details.id+'/',layer_details);
						},
						postLayerData: function(layer_details){
							return httpService.postRequest('layers/',layer_details);
						},
						categories:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/root/edit.layers.root.categories.structure.json',{},true,true);
							},
							getEditCategoriesTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/root/categories/edit.layers.root.categories.structure.json',{},true,true);
							},
							getCategoryTableData: function(category_details){
								return httpService.getRequest('categories',category_details);
							}
						},
						restrictions:{
							getTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/root/edit.layers.root.restrictions.structure.json',{},true,true);
							},
							getEditRestrictionsTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/root/restrictions/edit.layers.root.restrictions.structure.json',{},true,true);
							},
							getRestrictionTableData: function(category_details){
								return httpService.getRequest('restrictions',category_details);
							},
							getTableSelectStructure: function(){
								return httpService.getRequest('../app/pages/edit/layers/categories/edit.layers.categories.select.structure.json',{},true,true);
							}
						}
					}
				},
				tasks:{
					getTokenizationTaskEditTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/tasks/tokenization/edit.tasks.tokenization.structure.json',{},true,true);
					},
					getReviewTaskEditTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/tasks/edit.tasks.review.structure.json',{},true,true);
					},
					getAnnotationTaskEditTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/tasks/edit.tasks.annotation.structure.json',{},true,true);
					},
					getTaskData: function(task_id){
						return httpService.getRequest('tasks/'+task_id);
					},
					putTaskData: function(task_details){
						return httpService.putRequest('tasks/'+task_details.id+'/',task_details);
					},
					postTaskData: function(task_details){
						return httpService.postRequest('tasks/',task_details);
					},
					passages:{
						getPassagesTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/tasks/passages/edit.tasks.passages.table.structure.json',{},true,true);
						}
					},
					tokenization:{
						annotator: {
							getAnnotatorsTableStructure: function(){
								return httpService.getRequest('../app/pages/edit/tasks/tokenization/annotator/edit.tasks.tokenization.annotator.table.structure.json',{},true,true);
							}
						}
					}
				},
				passages:{
					getEditPassageTableStructure: function(){
						return httpService.getRequest('../app/pages/edit/passages/edit.passages.structure.json',{},true,true);
					},
					getPassageData: function(passage_id){
						return httpService.getRequest('passages/'+passage_id);
					},
					putPassageData: function(passage_details){
						return httpService.putRequest('passages/'+passage_details.id+'/',passage_details);
					},
					postPassageData: function(passage_details){
						return httpService.postRequest('passages/',passage_details);
					},
					sources:{
						getSourceTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/passages/sources/edit.passages.sources.structure.json',{},true,true);
						},
						getEditSourceTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/passages/sources/edit.passages.sources.structure.json',{},true,true);
						},
						getSourceTableData: function(searchTerms){
							return httpService.getRequest('sources',searchTerms);
						}
					},
					tasks:{
						getTasksTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/passages/tasks/edit.passages.tasks.structure.json', {}, true, true);
						},
						getTasksTableData: function(passage_id){
							return httpService.getRequest('passages/'+passage_id+'/tasks');
						}
					},
					projects:{
						getTasksTableStructure: function(){
							return httpService.getRequest('../app/pages/edit/passages/projects/edit.passages.projects.structure.json', {}, true, true);
						},
						getTasksTableData: function(passage_id){
							return httpService.getRequest('passages/'+passage_id+'/projects');
						}
					}
				}
			}
		}
		return api;
	}

})();