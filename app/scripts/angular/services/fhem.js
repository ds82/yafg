define(['app'], function( app ) {
  'use strict';

  var host = window.location.origin + '/actors';

  app.factory('FhemResource', ['$resource',
    function( $resource ) {
      return $resource( host, {}, {
        query: {
          method: 'GET',
          isArray: false
        },
        put: {
          method: 'POST',
          params: { actor: '@actor' },
          url: host + '/:actor'
        }
      });
    }
  ]);
});