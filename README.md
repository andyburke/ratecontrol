## ratecontrol

A simple rate controller for connect-style servers.

## Code Example

```javascript
const RateControl = require( 'ratecontrol' );

// use a global rate control
const globalRateControl = RateControl( {
    rate: '10/s'
} );

server.get( '/rate_limited', globalRateControl, onGetLimited );

// or use a specific one for a specific route

server.get( '/specific_rate_limited', RateControl( {
    rate: '1/s'
} ), onGetSpecificLimited );
```

## Motivation

A simple rate controller is nice to have.

## Installation

```
npm install --save ratecontrol
```

## Options Reference

### rate

A human-readable rate setting, egs:

```javascript
server.get( '/10_per_second', RateControl( {
    rate: '10/s'
} ), onRequest );

server.get( '/1_per_second', RateControl( {
    rate: '1/second'
} ), onRequest );

server.get( '/1000_per_day', RateControl( {
    rate: '1000/day'
} ), onRequest );
```

### trustedHeaders

An array of headers to trust for determining the source IP used for rate limiting. Default:

```javascript
[
    'x-client-ip',
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'fowarded'
]
```

Be wary of this setting. It is very liberal by default, which could allow a malicious actor
to spoof a changing IP and get around the rate control. This liberal setup assumes that you
have set up your app behind a sane proxy. If you'd like to lock this down, it's an easy
configuration change:

```javascript
server.get( '/locked_down', RateControl( {
    rate: '10/s',
    trustedHeaders: []
} ), onLockedDown );
```

### getId

You can override the method which determines the id of the client:

```javascript
server.get( '/override_getid', RateControl( {
    rate: '10/s',
    getId: ( request, callback ) => {
        callback( null, request.user.id );
    }
} ), onOverrideGetId );
```

By default, ratecontrol uses the IP address for rate limiting. First, the list of trusted
headers is checked, then request is examined to extract an IP. If no id can be found,
rate limiting is *not applied*.

### cache

Allows you to override the default cache. Must be an object with asynchronous get/set
methods that return a rate limiter with a consume() method. Eg:

```javascript
// let's use redis so we can do rate limiting
server.get( '/overridden_cache', RateControl( {
    rate: '10/s',
    cache: {
        get: ( id, callback ) => {
            redis.get( id, ( error, info ) => {
                if ( error ) {
                    callback( error );
                    return;
                }

                return TokenPipeline( info );
            } );
        },
        set: ( id, limiter, callback ) => {
            redis.set( id, limiter.toJSON(), callback );
        }
    }
} ), onOverriddenCache );
```

By default ratecontrol uses a small LRU in-memory cache.

### errorBody

You can override the body of the response when the rate limit is exceeded:

```javascript
server.get( '/custom_error_body', RateControl( {
    rate: '10/s',
    errorBody: '<html><body><blink>RATE LIMIT EXCEEDED</blink></body></html>'
} ), onCustomErrorBody );
```

By default, the response is a json object:

```json
{
    "error": "rate limit exceeded",
    "message": "Too many requests."
}
```

### onRateLimitExceeded

You can override the method called when the rate limit is exceeded:

```javascript
server.get( '/custom_rate_limit_method', RateControl( {
    rate: '10/s',
    onRateLimitExceeded: ( request, response, next ) => {
        mySecretLog.log( `rate limit exceeded for customer: ${request.customer}` );
        next(); // don't actually produce a user-visible error
    }
} ), onCustomRateLimitMethod );
```

## Tests

```
npm run test
```

## Contributing

Contributions are encouraged and appreciated. To make the process as quick and
painless as possible for everyone involved, here's a checklist that will make
a pull request easily accepted:

 1) Implement your new feature or bugfix
 2) Add or update tests to ensure coverage
 3) Ensure your code passes jshint according to the .jshintrc
 4) Ensure your code is formatted according to the .jsbeautifyrc
 5) Submit

## License

MIT
