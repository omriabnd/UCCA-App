/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
  'use strict';

  angular.module('zAdmin.const')
	.constant('ENV_CONST', {
		IS_DEV:true,
		TEST_URL:"http://ucca.development.cs.huji.ac.il/api/v1",
		PROD_URL:"http://ucca.development.cs.huji.ac.il/api/v1",
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
		TASK_STATUS_ID:{
			NOT_STARTED:1,
			ONGOING:2, 
			SUBMITTED:3, 
			REJECTED:4
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
			PROJECT_MANAGER:{
				name:"Project Manager",
				id:2,
				TABS: ["2","3","4","5","6","7","8","9"]
			},
			ANNOTATOR:{
				name:"Annotator",
				id:3,
				TABS: ["2","3"]
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
				name:"Toggle Parents",
				tooltip:"Toggle Parents",
				executeFunction:"toggleParents"
			},
			{
				id:2,
				name:"Finish All",
				tooltip:"Alt+a: Finish All",
				executeFunction:"finishAll"
			},
			{
				id:3,
				name:"Save",
				tooltip:"Alt+s: Save",
				executeFunction:"saveTask"
			},
			{
				id:4,
				name:"Submit",
				tooltip:"Alt+b: Submit (unit will be considered completed)",
				executeFunction:"submitTask"
			},
			{
				id:5,
				name:"Reset",
				tooltip:"Alt+x: Reset annotation",
				executeFunction:"resetAllAnnotations"
			},
			/*{
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
				id:8,
				name:"Main Menu",
				tooltip:"Alt+m: Go To Main Menu",
				executeFunction:"goToMainMenu"
			},
            {
				id:9,
				name:"User Comment",
				tooltip:"Alt+c: Add user comment",
				executeFunction:"addUserComment",
                showWhenFull: true
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

