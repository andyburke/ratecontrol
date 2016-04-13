'use strict';

const test = require( 'tape' );

test( 'INSTANTIATION: returns a function with proper scoped variables', function( t ) {
    const RateController = require( '../index.js' );
    const rateController = RateController();
    t.ok( rateController.options, 'has options object' );
    t.end();
} );

test( 'INSTANTIATION: accepts rate setting', function( t ) {
    const RateController = require( '../index.js' );

    t.equal( RateController( {
        rate: '10/minute'
    } ).options.rate, '10/minute', 'accepts a rate setting' );
    t.end();
} );
