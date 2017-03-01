/**
 * Animated load block
 */
(function () {
  'use strict';

  angular.module('zAdmin.theme')
      .directive('languageAlign', languageAlign);

  /** @ngInject */
  function languageAlign($timeout, $rootScope) {
    
    function isRTL(s){           
        var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
            rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
            rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');
        return rtlDirCheck.test(s);
    };
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var model = attrs.languageAlign;
        if (isRTL(model)){
          $(elem).css('direction','rtl');
        }
      }
    };
  }

})();