define(['app'], function( app ) {
  'use strict';

  app.controller('MainController', [
    '$scope', '$timeout', 'FhemResource', 
    function( $scope, $timeout, fhem ) {

      var timeoutFn = {};

      $scope.push = function( actor, value ) {
        
        if ( timeoutFn[actor] ) {
          $timeout.cancel( timeoutFn[actor] );
        }
        timeoutFn[actor] = $timeout(function() {
          fhem.put({ actor: actor, valve: value });
        }, 1500 );
      };

      $scope.controller = 'Main';
      $scope.fhem = fhem.query();

    }
  ]);
});