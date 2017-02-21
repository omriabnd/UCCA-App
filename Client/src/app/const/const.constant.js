
(function () {
  'use strict';

  angular.module('zAdmin.const')
	.constant('ENV_CONST', {
		IS_DEV:false,
		TEST_URL:"http://private-daea0-ucca.apiary-mock.com/api/v1",
		// PROD_URL:"http://localhost:8000/api/v1",
		PROD_URL:"http://ucca.staging.cs.huji.ac.il/api/v1", 
		LOCAL_RESOURCES: "app/resources",
		TASK_TYPE:{
			ANNOTATION:"ANNOTATION",
			TOKENIZATION:"TOKENIZATION",
			REVIEW:"REVIEW"
		},
		TASK_STATUS:{
			NOT_STARTED:"NOT_STARTED",
			ONGOING:"ONGOING", 
			SUBMITTED:"SUBMITTED", 
			REJECTED:"REJECTED"
		},
		ANNOTATION_TYPE:{
			IMPLICIT:"IMPLICIT",
			REGULAR:"REGULAR"
		},
		ROLE:{
			ADMIN:{
				name:"Admin",
				id:1,
				TABS: ["1","2","3","4","5","6","7","8","9"]
			},
			GUEST:{
				name:"Guest",
				id:2,
				TABS: ["2","3","4","5"]
			},
			PM:{
				name:"Project Manager",
				id:3,
				TABS: ["1","2","3"]
			},
			ANNOTATOR:{
				name:"Annotator",
				id:4,
				TABS: ["3","4"]
			}
		},
		RESTRICTIONS_TYPE:[
			{
				key:'REQUIRE_SIBLING',
				name: 'require sibling',
				value: 1
			},
			{
				key:'REQUIRE_CHILD',
				name: 'require child',
				value: 2
			},
			{
				key:'FORBID_SIBLING',
				name: 'forbid sibling',
				value: 3
			},
			{
				key:'FORBID_CHILD',
				name: 'forbid child',
				value: 4
			},
			{
				key:'FORBID_ANY_CHILD',
				name: 'forbid any child',
				value: 5
			}
		],
		LAYER_TYPE:{
			ROOT:"ROOT",
			EXTENSION:"EXTENSION", 
			COARSENING:"COARSENING", 
			REFINEMENT:"REFINEMENT"
		},
		ANNOTATION_GUI_STATUS:{
			OPEN:"Open",
			HIDDEN:"Hidden",
			COLLAPSE:"Collapse"
		},
		TABS_ID:["1","2","3","4","5","6","7","8","9"],
		NOTIFICATIONS:{
			USER_CREATED: "User Created.",
			GENERAL_ERROR: "Something went wrong. Please try again later."
		},
		CATEGORIES_COLORS:[
			{color:"white",backgroundColor:"#1c2b36"},
			{color:"white",backgroundColor:"#209e91"},
			{color:"white",backgroundColor:"#337ab7"},
			{color:"white",backgroundColor:"#dd4b39"},
			{color:"white",backgroundColor:"#4ab6d5"},
			{color:"white",backgroundColor:"#33560a"},
			{color:"white",backgroundColor:"#390a56"},
			{color:"white",backgroundColor:"#8c7367"},
			{color:"black",backgroundColor:"#c6e4f2"},
			{color:"white",backgroundColor:"#F58E20"},
			{color:"white",backgroundColor:"#3C7275"},
			{color:"white",backgroundColor:"#CF5C42"},
			{color:"white",backgroundColor:"#3C3CBA"},
			{color:"white",backgroundColor:"#064447"}
		],
		NAV_BAR_ITEMS:[
			{
				id:1,
				name:"Finish All",
				tooltip:"Alt+f: Finish All",
				executeFunction:"finishAll"
			},
			{
				id:1,
				name:"Save",
				tooltip:"Alt+s or Ctrl+s: Save",
				executeFunction:"saveTask"
			},
			{
				id:2,
				name:"Submit",
				tooltip:"Submit (unit will be considered completed)",
				executeFunction:"submitTask"
			},
			{
				id:3,
				name:"Report",
				tooltip:"Alt+n: Report this passage as unfit for annotation",
				executeFunction:"reportAsUnfitForAnnotation"
			},
			{
				id:4,
				name:"Write comment",
				tooltip:"Alt+r: Write comments on this passage",
				executeFunction:"writeComment"
			},
			{
				id:5,
				name:"Reset",
				tooltip:"Alt+x: Reset annotation",
				executeFunction:"resetAnnotation"
			},
			{
				id:6,
				name:"Help",
				tooltip:"?: Help",
				executeFunction:"help"
			},
			{
				id:7,
				name:"Settings",
				tooltip:"Alt+t: Settings",
				executeFunction:"openSettings"
			},
			{
				id:8,
				name:"Main Menu",
				tooltip:"Alt+h: Main Menu",
				executeFunction:"goToMainMenu"
			}
		],
		PASSAGE_TYPE:{
			'PRIVATE' : {
				id:1,
				label:'PRIVATE'
			},
			'PUBLIC' : {
				id:2,
				label:'PUBLIC'
			}
		}

	});

})();

