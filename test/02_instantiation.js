'use strict';

const test = require( 'tape' );

test( 'INSTANTIATION: returns a function with proper scoped variables', function( t ) {
    const rateController = require( '../index.js' );
    const rateControl = rateController();
    t.ok( rateControl.options, 'has options object' );
    t.end();
} );

test( 'INSTANTIATION: accepts rate setting', function( t ) {
    const rateController = require( '../index.js' );

    t.equal( rateController( {
        rate: '10/minute'
    } ).options.rate, '10/minute', 'accepts a rate setting' );
    t.end();
} );