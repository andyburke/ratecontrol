'use strict';

const test = require( 'tape' );

test( 'EXPORTS: module exports something', function( t ) {
    const RateController = require( '../index.js' );
    t.ok( RateController, 'exports ok' );
    t.end();
} );

test( 'EXPORTS: module exports a function', function( t ) {
    const RateController = require( '../index.js' );
    t.equal( typeof RateController, 'function', 'exports a function' );
    t.end();
} );

test( 'EXPORTS: exported function returns a function when called', function( t ) {
    const RateController = require( '../index.js' );
    t.equal( typeof RateController(), 'function', 'returns a function when called' );
    t.end();
} );
