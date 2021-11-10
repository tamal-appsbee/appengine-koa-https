'use strict';


module.exports = function (options) {
    options = options ? options : {};
    let maxAge = options.maxAge ? options.maxAge : 86400;
    let includeSubDomains = options.includeSubDomains !== undefined ? options.includeSubdomains : true;

    return async function yes(ctx, next) {
        //
        let ignoreRequest = (
            ctx.url.indexOf('/liveness_check') > -1 ||
            ctx.url.indexOf('/readiness_check') > -1
        );
        //
        let nodeENV = (process.env.NODE_ENV === 'production');
        //
        let secure = ctx.secure || (ctx.get('X-Forwarded-Proto') === "https");

        if (!ignoreRequest) {
            if (!secure && nodeENV) {
                ctx.status = 301;
                ctx.redirect('https://' + ctx.get('host') + ctx.url);
            } else {
                let header = 'max-age=' + maxAge;
                if (includeSubDomains) header += '; includeSubDomains'
                if (options.preload) header += '; preload'
                ctx.set('Strict-Transport-Security', header);
                await next();
            }
        } else {
            await next();
        }

    }
}