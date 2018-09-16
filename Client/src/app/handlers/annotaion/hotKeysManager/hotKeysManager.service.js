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
            checkIfCtrlOrCmdPressed: checkIfCtrlOrCmdPressed,
            checkIfHotKeyIsPressed:checkIfHotKeyIsPressed,
            getFocusedUnit: getFocusedUnit,
            setFocusedUnit: setFocusedUnit,
            setMouseMode:setMouseMode,
            getMouseMode: getMouseMode
        };
        
        return HotKeysManager;

        function addHotKey(hotKeyName){
            HotKeysManager.hotKeys[hotKeyName] = {};
            HotKeysManager.hotKeys[hotKeyName]['pressed'] = false;
        }

        function executeOperation(hotKey){
            return hotKey.callbackFunction;
        }

        function updatePressedHotKeys(hotKey,mode){
            // console.log('hotKeys[', hotKey.combo, ']["pressed"]=', mode);
            HotKeysManager.hotKeys[hotKey.combo]['pressed'] = mode;
        }

        function checkIfCtrlOrCmdPressed() { // On Windows check control, on Mac check Command
            // console.log("checkIfCtrlOrCmdPressed", window.navigator.platform )
            if (window.navigator.platform === 'MacIntel') {
                return this.checkIfHotKeyIsPressed('command');
            }
            return this.checkIfHotKeyIsPressed('ctrl'); // If window platform is 'windows'
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
        
    }

})();