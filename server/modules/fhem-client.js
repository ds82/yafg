var net          = require('net'),
    client       = net.connect({ port: 7072, host: 'pi.da.lan' }),

    regexp       = /([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2}) ([A-Z0-9a-z]*) ([A-Z0-9a-z_]*) ([A-Z0-9a-z]*) ([0-9]{1,3})/,

    nActor      = 8,
    nEntry      = 9,
    nValue      = 10,

    toWatch     = ['heizung_az'],
    nextRead    = [],
    watchMode   = false,
    db          = {};

function subscribeToEvents() {
  client.write( 'inform timer\r\n' );
}

function getWatchValues() {
  db = {};
  for( var i = 0, ii = toWatch.length; i < ii; ++i ) {
    nextRead.push( toWatch[i] );
    client.write( 'get ' + toWatch[i] + ' valve \r\n' );
  }
}

function setValve( actor, valve ) {
  console.log( 'setValve', actor, valve );
  client.write( 'set ' + actor + ' valve ' + valve + '\r\n' );
  db[actor].valve = valve;
}

function toDB( actor, value, entry ) {
  entry = entry || 'valve';

  if ( ! db[ actor ] ) {
    db[ actor ] = {};
  }
  db[ actor ][ entry ] = value;
}

function onData( match ) {
  toDB( match[nActor], match[nValue], match[nEntry] );
}

client.on('connect', function() {
  console.log( 'CONNECTED' );
  subscribeToEvents();
  getWatchValues();
});

client.on('end', function() {
  console.log( 'DISCONNECT' );
});

client.on('data', function( data ) {
  
  var match = regexp.exec( data );
  if ( match ) {
    console.log( match[nActor], match[nEntry], match[nValue] );
    //console.log( '<<', data.toString() );
    onData( match );
  
  } else {
    if ( nextRead.length ) {
      var actor = nextRead.shift();
      toDB( actor, parseInt( data.toString() ));

      //console.log( 'DB dump', db );
    }
  }
});


module.exports.use = function( app ) {
  
  app.get('/actors', function( req, res ) {
    res.send( db );
  });

  app.post('/actors/:actor', function( req, res ) {
    var data = req.body;
    
    console.log( '/actors/:actor', data );
    if ( data.actor && data.valve ) {
      setValve( data.actor, data.valve );
    }
    return data;
  });
};



// TESTING
if ( !module.parent ) {
  var repl = require('repl');
  repl.start({});
}
