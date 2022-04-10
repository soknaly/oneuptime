import StatusPageService from '../Services/statusPageService';
import { sendErrorResponse } from 'common-server/Utils/Response';
import BadDataException from 'common/types/exception/BadDataException';
import {
    ExpressResponse,
    ExpressRequest,
    NextFunction,
} from 'common-server/Utils/Express';
import apiMiddleware from './api';
import ipaddr from 'ipaddr.js';

const _this = {
    ipWhitelist: async function (
        req: ExpressRequest,
        res: ExpressResponse,
        next: NextFunction
    ) {
        const statusPageSlug = apiMiddleware.getStatusPageSlug(req);
        const statusPageUrl = apiMiddleware.getStatusPageUrl(req);
        let statusPage;

        try {
            if (
                statusPageSlug &&
                statusPageSlug.length &&
                statusPageSlug !== 'null'
            ) {
                statusPage = await StatusPageService.findOneBy({
                    query: { slug: statusPageSlug },
                    select: 'enableIpWhitelist ipWhitelist ',
                });
            } else {
                statusPage = await StatusPageService.findOneBy({
                    query: {
                        domains: { $elemMatch: { domain: statusPageUrl } },
                    },
                    select: 'enableIpWhitelist ipWhitelist ',
                });
            }
            if (statusPage === null) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Page Not Found',
                });
            }
        } catch (error) {
            return next();
        }

        if (!statusPage.enableIpWhitelist) {
            return next();
        }

        const ipWhitelist = statusPage.ipWhitelist
            ? [...statusPage.ipWhitelist]
            : [];
        // if ip whitelist is enabled and no ip is saved
        // block the access
        if (!ipWhitelist || ipWhitelist.length === 0) {
            return sendErrorResponse(
                req,
                res,
                new BadDataException('You are not allowed to view this page')
            );
        }

        let clientIp = this.getClientIp(req); // returns client ip or null
        if (Array.isArray(clientIp)) {
            clientIp = clientIp[0]; // get the first item on the list
        }

        if (!clientIp) {
            return sendErrorResponse(
                req,
                res,
                new BadDataException('You are not allowed to view this page')
            );
        }

        clientIp = clientIp.trim();
        const ipFound = ipWhitelist.some(ip => {
            if (ip.indexOf('-') !== -1) {
                const ipRange = ip.split('-').map((ip: $TSFixMe) => ip.trim());
                return this.inRange(clientIp, ipRange);
            }

            return this.check_single_cidr(clientIp, ip);
        });

        if (ipFound) {
            return next();
        }

        return sendErrorResponse(req, res, {
            code: 400,
            message: 'You are not allowed to view this page',
        });
    },

    /**
     * @description Gets the ip of the client
     * @param {Object} req Object made available by express
     */
    getClientIp: function (req: $TSFixMe) {
        // Cloudflare Connecting Ip.
        // https://support.cloudflare.com/hc/en-us/articles/200170786-Restoring-original-visitor-IPs-Logging-visitor-IP-addresses
        let ip =
            req.headers['cf-connecting-ip'] ||
            req.headers['x-original-forwarded-for'] ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        if (!ip) {
            return null;
        }

        ip = ip.split(',')[0];
        ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
        return ip;
    },

    // https://www.npmjs.com/package/ip-range-check
    check_single_cidr: function (addr: $TSFixMe, cidr: $TSFixMe) {
        try {
            const parsed_addr = ipaddr.process(addr);
            if (cidr.indexOf('/') === -1) {
                // handle case when ip is not CIDR
                const parsed_cidr_as_ip = ipaddr.process(cidr);
                if (
                    parsed_addr.kind() === 'ipv6' &&
                    parsed_cidr_as_ip.kind() === 'ipv6'
                ) {
                    return (
                        parsed_addr.toNormalizedString() ===
                        parsed_cidr_as_ip.toNormalizedString()
                    );
                }
                return parsed_addr.toString() == parsed_cidr_as_ip.toString();
            } else {
                const parsed_range = ipaddr.parseCIDR(cidr);
                return parsed_addr.match(parsed_range);
            }
        } catch (e) {
            return false;
        }
    },

    /**
     * @description converts an ip to a normal number, for comparison purposes
     * @param {String} ip a string container an ip address
     */
    IPtoNum: function (ip: $TSFixMe) {
        return Number(
            ip
                .split('.')
                .map((d: $TSFixMe) => ('000' + d).substr(-3))
                .join('')
        );
    },

    inRange: function (ip: $TSFixMe, range: $TSFixMe) {
        const min = this.IPtoNum(range[0]);
        const max = this.IPtoNum(range[1]);
        ip = this.IPtoNum(ip);

        if (isNaN(min) || isNaN(max) || isNaN(ip)) {
            return false;
        }

        return min <= ip && max >= ip;
    },
};

export default _this;