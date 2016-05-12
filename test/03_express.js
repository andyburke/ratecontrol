'use strict';

const agent = require( 'superagent' ).agent( '' );
const express = require( 'express' );
const test = require( 'tape' );

const PORT = 25252;

let app = null;
let server = null;
test( 'EXPRESS: create server', ( t ) => {
    app = express();
    t.ok( app, 'app created' );

    app.get( '/up', ( request, response ) => {
        response.send( {
            up: true
        } );
    } );

    server = app.listen( PORT, () => {
        agent
            .get( `http://localhost:${PORT}/up` )
            .end( ( error, response ) => {
                t.ok( response, 'got a response' );
                t.ok( response.ok, 'response is valid' );
                t.ok( response.body, 'response has body' );
                t.ok( response.body.up, 'server is up' );
                t.end();
            } );
    } );
    t.ok( server, 'server created' );
} );

test( 'EXPRESS: test route with no rate limiting (10 seconds)', ( t ) => {
    app.get( '/no_rate_limit', ( request, response ) => {
        response.send( {
            no_rate_limit: true
        } );
    } );

    const start = Date.now();
    const time = 1000 * 10;
    ( function makeRequest() {
        const now = Date.now();
        if ( now - start > time ) {
            t.pass( 'called unlimited method for 10 seconds' );
            t.end();
            return;
        }

        agent
            .get( `http://localhost:${PORT}/no_rate_limit` )
            .end( ( error, response ) => {
                if ( error ) {
                    t.fail( error );
                    t.end();
                    return;
                }

                if ( !response ) {
                    t.fail( 'missing response' );
                    t.end();
                    return;
                }

                if ( response.error ) {
                    t.fail( response.error );
                    t.end();
                    return;
                }

                setTimeout( makeRequest, 100 );
            } );
    } )();
} );

test( 'EXPRESS: create rate-limited route', ( t ) => {
    const rateController = require( '../index.js' );

    app.get( '/rate_limit', rateController( {
        rate: '1/s'
    } ), ( request, response ) => {
        response.send( {
            ok: true
        } );
    } );

    t.pass( 'created rate-limited route' );
    t.end();
} );

test( 'EXPRESS: test route with rate limiting (under limit, 10 seconds)', ( t ) => {
    const start = Date.now();
    const time = 1000 * 10;
    ( function makeRequest() {
        const now = Date.now();
        if ( now - start > time ) {
            t.pass( 'called limited method for 10 seconds' );
            t.end();
            return;
        }

        agent
            .get( `http://localhost:${PORT}/rate_limit` )
            .end( ( error, response ) => {
                if ( error ) {
                    t.fail( error );
                    t.end();
                    return;
                }

                if ( !response ) {
                    t.fail( 'missing response' );
                    t.end();
                    return;
                }

                if ( response.error ) {
                    t.fail( response.error );
                    t.end();
                    return;
                }

                setTimeout( makeRequest, 1001 );
            } );
    } )();
} );

test( 'EXPRESS: test route with rate limiting (over limit, 10 seconds)', ( t ) => {
    const start = Date.now();
    const time = 1000 * 10;
    let rejected = 0;
    ( function makeRequest() {
        const now = Date.now();
        if ( now - start > time ) {
            t.ok( rejected, 'got rejected requests' );
            t.end();
            return;
        }

        agent
            .get( `http://localhost:${PORT}/rate_limit` )
            .end( ( error, response ) => {
                if ( !response ) {
                    t.fail( 'missing response' );
                    t.end();
                    return;
                }

                if ( response.error && response.status !== 429 ) {
                    t.fail( response.error );
                    t.end();
                    return;
                }

                rejected += response.status === 429 ? 1 : 0;

                setTimeout( makeRequest, 100 );
            } );
    } )();
} );

test( 'EXPRESS: create burstable route', ( t ) => {
    const rateController = require( '../index.js' );

    app.get( '/burstable', rateController( {
        rate: '10/s'
    } ), ( request, response ) => {
        response.send( {
            ok: true
        } );
    } );

    t.pass( 'created burstable route' );
    t.end();
} );


test( 'EXPRESS: test bursting', ( t ) => {
    const start = Date.now();
    const time = 1000 * 1;
    let accepted = 0;
    let rejected = 0;
    ( function makeRequest() {
        const now = Date.now();
        if ( now - start > time ) {
            t.ok( accepted, 'got accepted requests' );
            t.ok( rejected, 'got rejected requests' );
            t.equal( accepted, 10, '10 accepted requests' );
            t.end();
            return;
        }

        agent
            .get( `http://localhost:${PORT}/burstable` )
            .end( ( error, response ) => {
                if ( !response ) {
                    t.fail( 'missing response' );
                    t.end();
                    return;
                }

                if ( response.error && response.status !== 429 ) {
                    t.fail( response.error );
                    t.end();
                    return;
                }

                rejected += response.status === 429 ? 1 : 0;
                accepted += response.ok ? 1 : 0;

                setTimeout( makeRequest, 10 );
            } );
    } )();
} );

test( 'EXPRESS: stop server', ( t ) => {
    server.close( ( error ) => {
        t.error( error, 'server closed' );
        t.end();
    } );
} );