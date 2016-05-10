'use strict';

const extend = require( 'extend' );
const getRequestIP = require( 'get-request-ip' );
const LRU = require( 'lru-cache' );
const TokenPipe = require( 'tokenpipe' );

function defaultCacheFactory() {
    const lru = LRU( {
        max: 10000,
        maxAge: 1000 * 60 * 60 * 24
    } );

    return {
        get: ( id, callback ) => {
            callback( null, lru.get( id ) );
        },
        set: ( id, data, callback ) => {
            lru.set( id, data );
            callback();
        }
    };
}

module.exports = function RateControl( _options ) {
    const options = extend( true, {
        trustedHeaders: [
            'x-client-ip',
            'x-forwarded-for',
            'x-real-ip',
            'x-cluster-client-ip',
            'x-forwarded',
            'forwarded-for',
            'fowarded'
        ],
        rate: '10/s',
        cache: defaultCacheFactory(),
        getId: ( request, callback ) => {
            callback( null, getRequestIP( request, {
                headers: options.trustedHeaders
            } ) );
        },
        errorBody: {
            error: 'rate limit exceeded',
            message: 'Too many requests.'
        },
        onRateLimitExceeded: ( request, response ) => {
            // modern
            if ( typeof response.status === 'function' ) {
                response.status( 429 );
                response.send( options.errorBody );
            }
            // legacy
            else {
                response.send( 429, options.errorBody );
            }
        }
    }, _options );

    function getLimiter( id, callback ) {
        options.cache.get( id, ( error, found ) => {
            if ( error ) {
                callback( error );
                return;
            }

            if ( found ) {
                callback( null, found );
                return;
            }

            found = TokenPipe( {
                rate: options.rate
            } );
            options.cache.set( id, found, ( error ) => {
                if ( error ) {
                    callback( error );
                    return;
                }

                callback( null, found );
            } );
        } );
    }

    function controlRate( request, response, next ) {
        options.getId( request, ( error, id ) => {
            if ( !id ) {
                next();
                return;
            }

            getLimiter( id, ( error, limiter ) => {
                if ( error ) {
                    next( error );
                    return;
                }

                if ( limiter.consume() ) {
                    next();
                    return;
                }
                else {
                    options.onRateLimitExceeded( request, response, next );
                }
            } );
        } );
    }

    controlRate.options = options;
    return controlRate;
};