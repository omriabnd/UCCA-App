(function() {
    'use strict';

    angular.module('zAdmin.annotation.hotKeysManager')
        .factory('HotKeysManager',HotKeysManager);


    /** @ngInject */
    function HotKeysManager() {
        var HotKeysManager = {
            mouseDown: false,
            hotKeys:{},
            focusedUnit: '0',
            addHotKey:addHotKey,
            updatePressedHotKeys:updatePressedHotKeys,
            executeOperation:executeOperation,
            checkIfHotKeyIsPressed:checkIfHotKeyIsPressed,
            getFocusedUnit: getFocusedUnit,
            setFocusedUnit: setFocusedUnit,
            setMouseMode:setMouseMode,
            getMouseMode: getMouseMode
        };

        function addHotKey(hotKeyName){
            HotKeysManager.hotKeys[hotKeyName] = {};
            HotKeysManager.hotKeys[hotKeyName]['pressed'] = false;
        }

        function executeOperation(hotKey){
            return hotKey.callbackFunction;
        }

        function updatePressedHotKeys(hotKey,mode){
            HotKeysManager.hotKeys[hotKey.combo]['pressed'] = mode;
        }

        function checkIfHotKeyIsPressed(hotKey){
            return HotKeysManager.hotKeys[hotKey]['pressed'];
        }

        function getFocusedUnit(){
            return HotKeysManager.focusedUnit;
        }

        function setFocusedUnit(newValue){
            HotKeysManager.focusedUnit = newValue;
        }

        function setMouseMode(isMouseDown){
            HotKeysManager.mouseDown = isMouseDown;
        }

        function getMouseMode(){
            return HotKeysManager.mouseDown;
        }
        return HotKeysManager;
    }

})();