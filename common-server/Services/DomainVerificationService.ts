import dns from 'dns';

import psl from 'psl';
import DomainVerificationTokenModel from '../Models/domainVerificationToken';
import flatten from '../utils/flattenArray';
import randomChar from '../utils/randomChar';
import StatusPageService from './StatusPageService';
import ProjectService from './ProjectService';
const dnsPromises = dns.promises;

import FindOneBy from '../types/db/FindOneBy';
import FindBy from '../types/db/FindBy';
import Query from '../types/db/Query';
import errorService from '../utils/error';

export default class Service {
    async create({ domain, projectId }: $TSFixMe) {
        const parsed = psl.parse(domain);
        const token = 'oneuptime=' + randomChar();

        // all domain should be tied to parentProject only

        const project = await ProjectService.findOneBy({
            query: { _id: projectId },
            select: 'parentProjectId',
        });
        if (!project) {
            const error = new Error('Project not found or does not exist');

            error.code = 400;
            throw error;
        }
        if (project.parentProjectId) {
            projectId = project.parentProjectId._id || project.parentProjectId;
        }

        const creationData = {
            domain: parsed.domain,
            verificationToken: token,
            verifiedAt: null,
            deletedAt: null,
            projectId,
        };

        return await DomainVerificationTokenModel.create(creationData);
    }

    async findOneBy({ query, select, populate, sort }: FindOneBy) {
        if (!query) {
            query = {};
        }
        query.deleted = false;

        if (query.domain) {
            const parsed = psl.parse(query.domain);
            query.domain = parsed.domain;
        }

        const domainQuery = DomainVerificationTokenModel.findOne(query)
            .sort(sort)
            .lean();

        domainQuery.select(select);
        domainQuery.populate(populate);

        const domain = await domainQuery;
        return domain;
    }

    async findBy({ query, limit, skip, populate, select, sort }: FindBy) {
        if (!skip) skip = 0;

        if (!limit) limit = 0;

        if (typeof skip === 'string') {
            skip = Number(skip);
        }

        if (typeof limit === 'string') {
            limit = Number(limit);
        }

        if (!query) {
            query = {};
        }
        query.deleted = false;

        if (query.domain) {
            const parsed = psl.parse(query.domain);
            query.domain = parsed.domain;
        }

        // fetch subproject
        if (query.projectId) {
            let subProjects = await ProjectService.findBy({
                query: { parentProjectId: query.projectId },
                select: '_id',
            });
            subProjects = subProjects.map((project: $TSFixMe) => project._id); // grab just the project ids
            const totalProjects = [query.projectId, ...subProjects];

            query = { ...query, projectId: { $in: totalProjects } };
        }

        const domainsQuery = DomainVerificationTokenModel.find(query)
            .lean()
            .sort(sort)
            .limit(limit.toNumber())
            .skip(skip.toNumber());
        domainsQuery.select(select);
        domainsQuery.populate(populate);

        const domains = await domainsQuery;
        return domains;
    }

    async updateOneBy(query: Query, data: $TSFixMe) {
        if (query && query.domain) {
            const parsed = psl.parse(query.domain);
            query.domain = parsed.domain;
        }

        if (!query) {
            query = {};
        }
        if (!query['deleted']) query['deleted'] = false;

        const updatedDomain =
            await DomainVerificationTokenModel.findOneAndUpdate(query, data, {
                new: true,
            });

        return updatedDomain;
    }

    async resetDomain(domain: $TSFixMe) {
        const updateObj = {
            verificationToken: 'oneuptime=' + randomChar(),
            verified: false,
            updatedAt: new Date(),
        };
        const updatedDomain = await this.updateOneBy(
            { _id: domain },
            updateObj
        );
        return updatedDomain;
    }

    async doesTxtRecordExist(subDomain: $TSFixMe, verificationToken: $TSFixMe) {
        try {
            const parsed = psl.parse(subDomain);
            const host = 'oneuptime';
            const previousHost = 'oneuptime';
            const domain = parsed.domain;
            const domainToLookup = `${host}.${domain}`;
            const prevDomainToLookup = `${previousHost}.${domain}`;

            const records = await dnsPromises.resolveTxt(domainToLookup);
            // records is an array of arrays
            // flatten the array to a single array
            const txtRecords = flatten(records);
            const result = txtRecords.some(
                txtRecord => verificationToken === txtRecord
            );

            if (result) {
                return { result, txtRecords };
            } else {
                const records = await dnsPromises.resolveTxt(
                    prevDomainToLookup
                );
                // records is an array of arrays
                // flatten the array to a single array
                const txtRecords = flatten(records);
                const result = txtRecords.some(
                    txtRecord => verificationToken === txtRecord
                );

                return { result, txtRecords };
            }
        } catch (error) {
            if (error.code === 'ENODATA') {
                throw {
                    message: 'TXT record not found.',
                    code: 400,
                };
            }

            if (error.code === 'ENOTFOUND') {
                throw {
                    message:
                        "TXT record not found. If you've just made a change, it might take more than 48 hours for your DNS to reflect changes.",
                    code: 400,
                };
            }

            throw error;
        }
    }

    async doesDomainBelongToProject(projectId: string, subDomain: $TSFixMe) {
        // ensure that a particular domain is available to all project and subProject
        // domain added to a project should be available for both project and subProjects
        // domain added to a subProject should be available to other subProjects and project

        const project = await ProjectService.findOneBy({
            query: { _id: projectId },
            select: '_id parentProjectId',
        });
        let projectList = [project._id];
        let subProjects = [];
        if (project.parentProjectId) {
            projectList.push(
                project.parentProjectId._id || project.parentProjectId
            );

            // find all the subProjects attached to this parent project

            subProjects = await ProjectService.findBy({
                query: {
                    parentProjectId:
                        project.parentProjectId._id || project.parentProjectId,
                },
                select: '_id',
            });
        } else {
            subProjects = await ProjectService.findBy({
                query: { parentProjectId: project._id },
                select: '_id',
            });
        }
        subProjects = subProjects.map((project: $TSFixMe) => project._id); // grab just the project ids
        projectList.push(...subProjects);

        projectList = projectList.filter(
            (projectId, index) => projectList.indexOf(projectId) === index
        );

        const parsed = psl.parse(subDomain);
        const domain = parsed.domain;
        const result = await DomainVerificationTokenModel.find({
            domain,
            /**
             * USE CASE THAT WARRANT REMOVAL OF VERIFIED FIELD
             *
             * A user can have the same unverified domain in more than one project,
             * and if they verify the domain, that means we now have the same verified domains in two different project
             * defeating the initial purpose of this
             */
            // verified: true,
            projectId: { $nin: projectList },
            deleted: false,
        });

        if (result && result.length > 0) {
            return true;
        }

        return false;
    }

    async hardDeleteBy(query: Query) {
        await DomainVerificationTokenModel.deleteMany(query);
        return 'Domain verification token(s) Removed Successfully!';
    }

    async deleteBy(query: Query) {
        const domainCount = await this.countBy(query);

        if (!domainCount || domainCount === 0) {
            const error = new Error('Domain not found or does not exist');

            error.code = 400;
            throw error;
        }

        const domain = await this.updateOneBy(query, {
            deleted: true,
            deletedAt: Date.now(),
        });

        const statusPages = await StatusPageService.findBy({
            query: {
                domains: {
                    $elemMatch: { domainVerificationToken: domain._id },
                },
            },
            select: '_id domains',
        });

        // making this synchronous is intentional
        // so we don't have a delay in deleting domains from project settings
        // while all custom domains is deleted gradually in the background

        for (const statusPage of statusPages) {
            const statusPageId = statusPage._id;
            for (const eachDomain of statusPage.domains) {
                if (
                    String(eachDomain.domainVerificationToken._id) ===
                    String(domain._id)
                ) {
                    // delete all custom domains attached to this domain
                    StatusPageService.deleteDomain(
                        statusPageId,
                        eachDomain._id
                    ).catch(error => {
                        errorService.log(
                            'StatusPageService.deleteDomain',
                            error
                        );
                    });
                }
            }
        }

        return domain;
    }

    async findDomain(domainId: $TSFixMe, projectArr = []) {
        let projectId;
        for (const pId of projectArr) {
            const populateDomainVerify = [{ path: 'projectId', select: '_id' }];
            const check = await this.findOneBy({
                query: { _id: domainId, projectId: pId },
                select: 'projectId',
                populate: populateDomainVerify,
            });
            if (check) {
                projectId = check.projectId._id;
            }
        }
        return projectId;
    }

    async countBy(query: Query) {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) query['deleted'] = false;

        // fetch subproject
        if (query.projectId) {
            let subProjects = await ProjectService.findBy({
                query: { parentProjectId: query.projectId },
                select: '_id',
            });
            subProjects = subProjects.map((project: $TSFixMe) => project._id); // grab just the project ids
            const totalProjects = [query.projectId, ...subProjects];

            query = { ...query, projectId: { $in: totalProjects } };
        }

        const count = await DomainVerificationTokenModel.countDocuments(query);
        return count;
    }
}