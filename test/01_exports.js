'use strict';

const test = require( 'tape' );

test( 'EXPORTS: module exports something', function( t ) {
    const rateController = require( '../index.js' );
    t.ok( rateController, 'exports ok' );
    t.end();
} );

test( 'EXPORTS: module exports a function', function( t ) {
    const rateController = require( '../index.js' );
    t.equal( typeof rateController, 'function', 'exports a function' );
    t.end();
} );

test( 'EXPORTS: exported function returns a function when called', function( t ) {
    const rateController = require( '../index.js' );
    t.equal( typeof rateController(), 'function', 'returns a function when called' );
    t.end();
} );