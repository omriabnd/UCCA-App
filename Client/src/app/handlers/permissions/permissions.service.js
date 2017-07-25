
/* Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University. */
(function () {
    'use strict';

    angular.module('zAdmin.permissions')
        .service('PermissionsService', PermissionsService);

    /** @ngInject */
    function PermissionsService($q,PermPermissionStore,PermRoleStore,ENV_CONST,Core) {
        var service = {
            setPermissions: function(user_role){
                return  $q(function(resolve, reject) {
                    if (setUserPermissions(user_role,ENV_CONST)) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                });
            },
            init:init
        };

        init();

        function init(){
            for(var i=0; i<ENV_CONST.TABS_ID.length; i++){
                PermPermissionStore.definePermission(ENV_CONST.TABS_ID[i],function(permissionName){
                    return ENV_CONST.ROLE[Core.user_role.name.toUpperCase()].TABS.includes(permissionName)
                });
            }
            setUserPermissions(Core.user_role.id);
        }

        function setUserPermissions(user_role){
            switch(user_role){
                case ENV_CONST.ROLE.ADMIN.id:{
                    PermRoleStore.defineRole('ADMIN',ENV_CONST.TABS_ID,function(){return true});
                    return true;
                }
                case ENV_CONST.ROLE.GUEST.id:{
                    PermRoleStore.defineRole('GUEST',ENV_CONST.TABS_ID,function(){return true});
                    return true;
                }
                case ENV_CONST.ROLE.PROJECT_MANAGER.id:{
                    PermRoleStore.defineRole('PROJECT_MANAGER',function(){return true});
                    return true;
                }
                case ENV_CONST.ROLE.ANNOTATOR.id:{
                    PermRoleStore.defineRole('ANNOTATOR',function(){return true});
                    return true;
                }

            }
            return true;
        }

        return service;
    }



})();
