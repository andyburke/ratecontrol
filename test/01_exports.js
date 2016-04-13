'use strict';

const test = require( 'tape' );

test( 'EXPORTS: module exports something', function( t ) {
    const RateControl = require( '../index.js' );
    t.ok( RateControl, 'exports ok' );
    t.end();
} );

test( 'EXPORTS: module exports a function', function( t ) {
    const RateControl = require( '../index.js' );
    t.equal( typeof RateControl, 'function', 'exports a function' );
    t.end();
} );

test( 'EXPORTS: exported function returns a function when called', function( t ) {
    const RateControl = require( '../index.js' );
    t.equal( typeof RateControl(), 'function', 'returns a function when called' );
    t.end();
} );
