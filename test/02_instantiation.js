'use strict';

const test = require( 'tape' );

test( 'INSTANTIATION: returns a function with proper scoped variables', function( t ) {
    const RateControl = require( '../index.js' );
    const rateControl = RateControl();
    t.ok( rateControl.options, 'has options object' );
    t.end();
} );

test( 'INSTANTIATION: accepts rate setting', function( t ) {
    const RateControl = require( '../index.js' );

    t.equal( RateControl( {
        rate: '10/minute'
    } ).options.rate, '10/minute', 'accepts a rate setting' );
    t.end();
} );
