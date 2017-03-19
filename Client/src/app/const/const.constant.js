
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.const')
	.constant('ENV_CONST', {
		IS_DEV:false,
		TEST_URL:"http://private-daea0-ucca.apiary-mock.com/api/v1",
		PROD_URL:"http://localhost:8000/api/v1",
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
			PM:{
				name:"Project Manager",
				id:2,
				TABS: ["1","2","3"]
			},
			ANNOTATOR:{
				name:"Annotator",
				id:3,
				TABS: ["3","4"]
			},
			GUEST:{
				name:"Guest",
				id:4,
				TABS: ["2","3","4","5"]
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
			OPEN:"OPEN",
			HIDDEN:"HIDDEN",
			COLLAPSE:"COLLAPSE"
		},
		TABS_ID:["1","2","3","4","5","6","7","8","9"],
		NOTIFICATIONS:{
			USER_CREATED: "User Created.",
			GENERAL_ERROR: "Something went wrong. Please try again later."
		},
		CATEGORIES_COLORS:[
			{color: "white", backgroundColor: "#444267"},
			{color: "white", backgroundColor: "#0c9640"},
			{color: "white", backgroundColor: "#AACC55"},
			{color: "white", backgroundColor: "#db3937"},
			{color: "white", backgroundColor: "#9302d9"},
			{color: "white", backgroundColor: "#ef86af"},
			{color: "white", backgroundColor: "#ff7b23"},
			{color: "white", backgroundColor: "#3f32fe"},
			{color: "white", backgroundColor: "#cb9d02"},
			{color: "white", backgroundColor: "#935754"},
			{color: "white", backgroundColor: "#4099b7"},
			{color: "black", backgroundColor: "#66CDAA"},
			{color: "white", backgroundColor: "#DC143C"}
		],
		NAV_BAR_ITEMS:[
			{
				id:1,
				name:"Finish All",
				tooltip:"Alt+a: Finish All",
				executeFunction:"finishAll"
			},
			{
				id:2,
				name:"Save",
				tooltip:"Alt+s: Save",
				executeFunction:"saveTask"
			},
			{
				id:3,
				name:"Submit",
				tooltip:"Alt+b: Submit (unit will be considered completed)",
				executeFunction:"submitTask"
			},
			/*{
				id:4,
				name:"Reset",
				tooltip:"Alt+x: Reset annotation",
				executeFunction:"resetAnnotation"
			},
			{
				id:5,
				name:"Help",
				tooltip:"?: Help",
				executeFunction:"help"
			},
			{
				id:6,
				name:"Settings",
				tooltip:"Alt+t: Settings",
				executeFunction:"openSettings"
			},*/
			{
				id:7,
				name:"Main Menu",
				tooltip:"Alt+m: Go To Main Menu",
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

