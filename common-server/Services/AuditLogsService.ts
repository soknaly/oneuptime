export default class Service {
    async findBy({ query, skip, limit, populate, select, sort }: FindBy) {
        const auditLogsQuery = AuditLogsModel.find(query)
            .lean()
            .sort(sort)
            .limit(limit.toNumber())
            .skip(skip.toNumber());

        auditLogsQuery.select(select);
        auditLogsQuery.populate(populate);

        const auditLogs = await auditLogsQuery;

        return auditLogs;
    }

    async countBy({ query }: Query) {
        if (!query) {
            query = {};
        }

        const count = await AuditLogsModel.countDocuments(query);
        return count;
    }

    async create(data: $TSFixMe) {
        const auditLogsModel = new AuditLogsModel({
            userId: data.userId,
            projectId: data.projectId,
            request: data.request,
            response: data.response,
        });

        const auditLog = await auditLogsModel.save();
        return auditLog;
    }

    async search({ filter, skip, limit }: $TSFixMe) {
        const query = {
            'request.apiSection': {
                $regex: new RegExp(filter),
                $options: 'i',
            },
        };

        const populateAuditLog = [
            { path: 'userId', select: 'name' },
            { path: 'projectId', select: 'name' },
        ];

        const selectAuditLog = 'userId projectId request response createdAt';

        const [searchedAuditLogs, totalSearchCount] = await Promise.all([
            this.findBy({
                query,
                skip,
                limit,
                populate: populateAuditLog,
                select: selectAuditLog,
            }),
            this.countBy({ query }),
        ]);

        return { searchedAuditLogs, totalSearchCount };
    }

    async hardDeleteBy({ query }: $TSFixMe) {
        await AuditLogsModel.deleteMany(query);
    }
}

import AuditLogsModel from '../Models/auditLogs';

import FindBy from '../types/db/FindBy';
import Query from '../types/db/Query';