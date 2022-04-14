import MonitorModel from '../Models/monitor';
import ObjectID from 'Common/Types/ObjectID';
import ProbeService from './ProbeService';
import MonitorStatusService from './MonitorStatusService';
import MonitorLogService from './MonitorLogService';
import MonitorLogByHourService from './MonitorLogByHourService';
import MonitorLogByDayService from './MonitorLogByDayService';
import MonitorLogByWeekService from './MonitorLogByWeekService';
import ResourceCategoryService from './ResourceCategoryService';
import MonitorCriteriaService from './MonitorCriteriaService';
import Plans from './../config/plans';
import RealTimeService from './realTimeService';
import NotificationService from './NotificationService';
import ProjectService from './ProjectService';
import PaymentService from './PaymentService';
import IncidentService from './IncidentService';
import AlertService from './AlertService';
import StatusPageService from './StatusPageService';
import ScheduleService from './ScheduleService';
import IntegrationService from './IntegrationService';
import TeamService from './TeamService';
import moment from 'moment';
import BadDataException from 'Common/Types/Exception/BadDataException';
import _ from 'lodash';
import { IS_SAAS_SERVICE } from '../config/server';
import ScheduledEventService from './ScheduledEventService';
import MonitorSlaService from './MonitorSlaService';
import IncomingRequestService from './IncomingRequestService';
import componentService from './ComponentService';
import getSlug from '../Utils/getSlug';

import FindOneBy from '../Types/DB/FindOneBy';
import Query from '../Types/DB/Query';

import PositiveNumber from 'Common/Types/PositiveNumber';
import FindBy from '../Types/DB/FindBy';

export default class Service {
    //Description: Upsert function for monitor.
    //Params:
    //Param 1: data: MonitorModal.
    //Returns: promise with monitor model or error.
    async create(data: $TSFixMe): void {
        let subProject: $TSFixMe = null;

        const query: $TSFixMe = {
            name: data.name,
            componentId: data.componentId,
            projectId: data.projectId,
        };
        const select: string = 'name _id';
        const existingMonitor: $TSFixMe = await this.findBy({
            query,
            select,
        });

        if (existingMonitor && existingMonitor.length > 0) {
            throw new BadDataException(
                'Monitor with that name already exists.'
            );
        }

        let project: $TSFixMe = await ProjectService.findOneBy({
            query: { _id: data.projectId },
            select: 'parentProjectId _id users stripePlanId',
        });
        if (project.parentProjectId) {
            subProject = project;

            project = await ProjectService.findOneBy({
                query: { _id: subProject.parentProjectId },
                select: '_id users stripePlanId',
            });
        }
        let subProjectIds: $TSFixMe = [];
        const selectResourceCat: string =
            'projectId name createdById createdAt';
        const [subProjects, count, resourceCategory]: $TSFixMe =
            await Promise.all([
                ProjectService.findBy({
                    query: { parentProjectId: project._id },
                    select: '_id users', // Subprojects require it for monitor creation
                }),
                this.countBy({
                    projectId: { $in: subProjectIds },
                }),
                ResourceCategoryService.findBy({
                    query: { _id: data.resourceCategory },
                    select: selectResourceCat,
                }),
            ]);
        let userCount: $TSFixMe = 0;
        if (subProjects && subProjects.length > 0) {
            const userId: ObjectID = [];
            subProjectIds = subProjects.map((project: $TSFixMe) => project._id);
            subProjects.map((subProject: $TSFixMe) => {
                subProject.users.map((user: $TSFixMe) => {
                    if (!userId.includes(user.userId)) {
                        userId.push(user.userId);
                    }
                    return user;
                });
                return subProject;
            });
            userCount = userId.length;
        } else {
            userCount = project.users.length;
        }
        subProjectIds.push(project._id);
        let plan: $TSFixMe = Plans.getPlanById(project.stripePlanId);
        // null plan => enterprise plan

        plan = plan && plan.category ? plan : { category: 'Enterprise' };

        if (!plan && IS_SAAS_SERVICE) {
            throw new BadDataException('Invalid project plan.');
        } else {
            const unlimitedMonitor: $TSFixMe = ['Scale', 'Enterprise'];
            const monitorCount: $TSFixMe =
                plan.category === 'Startup'
                    ? 5
                    : plan.category === 'Growth'
                    ? 10
                    : 0;
            if (
                count < userCount * monitorCount ||
                !IS_SAAS_SERVICE ||
                unlimitedMonitor.includes(plan.category)
            ) {
                const monitor: $TSFixMe = new MonitorModel();

                monitor.name = data.name;

                monitor.type = data.type;

                monitor.monitorSla = data.monitorSla;

                monitor.incidentCommunicationSla =
                    data.incidentCommunicationSla;

                monitor.customFields = data.customFields;

                monitor.createdById = data.createdById;

                monitor.scripts = data.scripts || [];

                monitor.regions = [];
                if (data.type === 'url' || data.type === 'api') {
                    monitor.data = {};

                    monitor.data.url = data.data.url;
                } else if (data.type === 'manual') {
                    monitor.data = {};

                    monitor.data.description = data.data.description || null;
                } else if (data.type === 'script') {
                    monitor.data = {};

                    monitor.data.script = data.data.script;
                } else if (data.type === 'incomingHttpRequest') {
                    monitor.data = {};

                    monitor.data.link = data.data.link;
                } else if (data.type === 'ip') {
                    monitor.data = {};

                    monitor.data.IPAddress = data.data.IPAddress;
                }
                if (resourceCategory) {
                    monitor.resourceCategory = data.resourceCategory;
                }

                monitor.visibleOnStatusPage = data.visibleOnStatusPage;

                monitor.componentId = data.componentId;

                monitor.projectId = data.projectId;
                if (data.agentlessConfig) {
                    monitor.agentlessConfig = data.agentlessConfig;
                }
                if (
                    data.type === 'url' ||
                    data.type === 'api' ||
                    data.type === 'server-monitor' ||
                    data.type === 'script' ||
                    data.type === 'incomingHttpRequest' ||
                    data.type === 'kubernetes' ||
                    data.type === 'ip'
                ) {
                    monitor.criteria = _.isEmpty(data.criteria)
                        ? MonitorCriteriaService.create(data.type)
                        : data.criteria;
                }

                if (data.type === 'kubernetes') {
                    monitor.kubernetesConfig = data.kubernetesConfig;

                    monitor.kubernetesNamespace = data.kubernetesNamespace;
                }

                if (data.type === 'api') {
                    if (data.method && data.method.length) {
                        monitor.method = data.method;
                    }
                    if (data.bodyType && data.bodyType.length) {
                        monitor.bodyType = data.bodyType;
                    }

                    if (data.text && data.text.length) {
                        monitor.text = data.text;
                    }
                    if (data.formData && data.formData.length) {
                        monitor.formData = data.formData;
                    }
                    if (data.headers && data.headers.length) {
                        monitor.headers = data.headers;
                    }
                }
                if (data.type === 'url') {
                    monitor.siteUrls = [monitor.data.url];
                }
                if (data && data.name) {
                    monitor.slug = getSlug(data.name);
                }
                const savedMonitor: $TSFixMe = await monitor.save();

                const select: $TSFixMe =
                    '_id name slug data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields';
                const populate: $TSFixMe = [
                    {
                        path: 'monitorSla',
                        select: 'frequency _id',
                    },
                    { path: 'componentId', select: 'name' },
                    { path: 'incidentCommunicationSla', select: '_id' },
                ];
                const populatedMonitor: $TSFixMe = await this.findOneBy({
                    query: { _id: savedMonitor._id },
                    select,
                    populate,
                });

                if (data.type === 'manual') {
                    await MonitorStatusService.create({
                        monitorId: populatedMonitor
                            ? populatedMonitor._id
                            : savedMonitor._id,
                        manuallyCreated: true,
                        status: 'online',
                    });
                }
                return populatedMonitor || savedMonitor;
            } else {
                const error: $TSFixMe = new Error(
                    "You can't add any more monitors. Please upgrade your account."
                );

                error.code = 400;
                throw error;
            }
        }
    }

    async markMonitorsAsShouldNotMonitor(monitorIds: $TSFixMe): void {
        await MonitorModel.updateMany(
            {
                _id: { $in: monitorIds },
            },
            {
                $set: { shouldNotMonitor: true },
            }
        );
    }

    async markMonitorsAsShouldMonitor(monitorIds: $TSFixMe): void {
        await MonitorModel.updateMany(
            {
                _id: { $in: monitorIds },
            },
            {
                $set: { shouldNotMonitor: false },
            }
        );
    }

    async unsetColumnsOfManyMonitors(
        monitorIds: $TSFixMe,
        columns: $TSFixMe
    ): void {
        await MonitorModel.updateMany(
            {
                _id: { $in: monitorIds },
            },
            {
                $unset: { ...columns },
            }
        );
    }

    async updateManyIncidentCommunicationSla(
        monitorIds: $TSFixMe,
        incidentCommunicationSlaId: $TSFixMe
    ): void {
        await MonitorModel.updateMany(
            {
                _id: { $in: monitorIds },
            },
            {
                $set: {
                    incidentCommunicationSla: incidentCommunicationSlaId,
                },
            }
        );
    }

    async updateManyMonitorSla(
        monitorIds: $TSFixMe,
        monitorSlaId: $TSFixMe
    ): void {
        await MonitorModel.updateMany(
            {
                _id: { $in: monitorIds },
            },
            {
                $set: { monitorSla: monitorSlaId },
            }
        );
    }

    async updateCriterion(_id: $TSFixMe, lastMatchedCriterion: $TSFixMe): void {
        await MonitorModel.updateOne(
            { _id },
            { $set: { lastMatchedCriterion } },
            {
                new: true,
            }
        );
    }

    async updateLighthouseScanStatus(
        _id: $TSFixMe,
        lighthouseScanStatus: $TSFixMe,
        lighthouseScannedBy: $TSFixMe
    ): void {
        const updateData: $TSFixMe = {};

        if (lighthouseScanStatus !== 'scanning') {
            updateData.lighthouseScannedAt = Date.now();

            updateData.lighthouseScannedBy = lighthouseScannedBy;
        } else {
            updateData.fetchLightHouse = null;
        }

        await MonitorModel.updateOne(
            { _id },
            {
                $set: {
                    lighthouseScanStatus,
                    ...updateData,
                },
            },
            {
                new: true,
            }
        );

        const select: $TSFixMe =
            '_id monitorStatus name slug statusPageCategory resourceCategory data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields siteUrls lighthouseScanStatus';
        const populate: $TSFixMe = [
            {
                path: 'monitorSla',
                select: 'frequency _id',
            },
            { path: 'componentId', select: 'name' },
            { path: 'incidentCommunicationSla', select: '_id' },
            { path: 'resourceCategory', select: 'name' },
            { path: 'statusPageCategory', select: 'name' },
        ];
        const query: $TSFixMe = { _id };

        const monitor: $TSFixMe = await this.findOneBy({
            query,
            select,
            populate,
        });
        RealTimeService.monitorEdit(monitor);
        return monitor;
    }

    async disableMonitor(_id: $TSFixMe, isDisabledOrEnable: $TSFixMe): void {
        await MonitorModel.updateOne(
            { _id },
            {
                $set: {
                    disabled: isDisabledOrEnable,
                },
            }
        );
    }

    async updateScriptStatus(
        _id: $TSFixMe,
        scriptRunStatus: $TSFixMe,
        scriptRunBy: $TSFixMe
    ): void {
        await MonitorModel.updateOne(
            { _id },
            {
                $set: {
                    scriptRunStatus,
                    scriptRunBy,
                },
            },
            {
                new: true,
            }
        );
    }

    async updateOneBy(query: Query, data: $TSFixMe, unsetData: $TSFixMe): void {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) {
            query['deleted'] = false;
        }

        await this.updateMonitorSlaStat(query);

        let errorMsg;
        if (data && data.customFields && data.customFields.length > 0) {
            const select: string = '_id';
            const monitor: $TSFixMe = await this.findOneBy({ query, select });
            for (const field of data.customFields) {
                if (field.uniqueField) {
                    const query: $TSFixMe = {
                        customFields: {
                            $elemMatch: {
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                fieldValue: field.fieldValue,
                            },
                        },
                    };
                    const _monitor: $TSFixMe = await this.findOneBy({
                        query,
                        select,
                    });

                    if (
                        _monitor &&
                        String(monitor._id) !== String(_monitor._id)
                    ) {
                        errorMsg = `The field ${field.fieldName} should be unique. It already exists on another monitor.`;
                    }
                }
            }
        }

        if (errorMsg) {
            const error: $TSFixMe = new Error(errorMsg);

            error.code = 400;
            throw error;
        }

        if (data) {
            if (data.name) {
                data.slug = getSlug(data.name);
            }
            await MonitorModel.updateOne(
                query,
                { $set: data },
                {
                    new: true,
                }
            );
        }

        if (unsetData) {
            await MonitorModel.updateOne(
                query,
                { $unset: unsetData },
                {
                    new: true,
                }
            );
        }
        query['deleted'] = false;

        const select: $TSFixMe =
            '_id monitorStatus name slug statusPageCategory resourceCategory data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields siteUrls lighthouseScanStatus';
        const populate: $TSFixMe = [
            {
                path: 'monitorSla',
                select: 'frequency _id',
            },
            { path: 'componentId', select: 'name slug' },
            { path: 'incidentCommunicationSla', select: '_id' },
            { path: 'resourceCategory', select: 'name' },
            { path: 'statusPageCategory', select: 'name' },
        ];
        const monitor: $TSFixMe = await this.findOneBy({
            query,
            select,
            populate,
        });
        // run in the background
        RealTimeService.monitorEdit(monitor);

        return monitor;
    }

    async updateBy(query: Query, data: $TSFixMe): void {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) {
            query['deleted'] = false;
        }
        let updatedData: $TSFixMe = await MonitorModel.updateMany(query, {
            $set: data,
        });
        const select: $TSFixMe =
            '_id monitorStatus name slug data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields';
        const populate: $TSFixMe = [
            {
                path: 'monitorSla',
                select: 'frequency _id',
            },
            { path: 'componentId', select: 'name' },
            { path: 'incidentCommunicationSla', select: '_id' },
        ];
        updatedData = await this.findBy({ query, select, populate });
        return updatedData;
    }

    // To be used to know the current status of a monitor
    // online, offline or degraded
    async updateAllMonitorStatus(query: Query, data: $TSFixMe): void {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) {
            query['deleted'] = false;
        }
        const updatedData: $TSFixMe = await MonitorModel.updateMany(query, {
            $set: data,
        });
        return updatedData;
    }

    //Description: Gets all monitors by project.
    //Params:
    //Param 1: data: MonitorModal.
    //Returns: promise with monitor model or error.
    async findBy({ query, limit, skip, sort, populate, select }: FindBy): void {
        if (!skip) {
            skip = 0;
        }

        if (!limit) {
            limit = 0;
        }

        if (typeof skip === 'string') {
            skip = parseInt(skip);
        }

        if (typeof limit === 'string') {
            limit = parseInt(limit);
        }

        if (!query) {
            query = {};
        }

        if (!query['deleted']) {
            query['deleted'] = false;
        }

        const monitorQuery: $TSFixMe = MonitorModel.find(query)
            .lean()
            .sort(sort)
            .limit(limit.toNumber())
            .skip(skip.toNumber());

        monitorQuery.select(select);
        monitorQuery.populate(populate);

        const monitors: $TSFixMe = await monitorQuery;
        return monitors;
    }

    async findOneBy({ query, populate, select, sort }: FindOneBy): void {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) {
            query['deleted'] = false;
        }

        const monitorQuery: $TSFixMe = MonitorModel.findOne(query)
            .sort(sort)
            .lean();

        monitorQuery.select(select);
        monitorQuery.populate(populate);

        const monitor: $TSFixMe = await monitorQuery;
        return monitor;
    }

    async countBy(query: Query): void {
        if (!query) {
            query = {};
        }

        if (!query['deleted']) {
            query['deleted'] = false;
        }
        const count: $TSFixMe = await MonitorModel.countDocuments(query);
        return count;
    }

    async deleteBy(query: Query, userId: ObjectID): void {
        if (!query) {
            query = {};
        }

        query['deleted'] = false;
        const monitor: $TSFixMe = await MonitorModel.findOneAndUpdate(
            query,
            {
                $set: {
                    deleted: true,
                    deletedAt: Date.now(),
                    deletedById: userId,
                },
            },
            { new: true }
        ).populate('deletedById', 'name');

        if (monitor) {
            let subProject: $TSFixMe = null;

            let project: $TSFixMe = await ProjectService.findOneBy({
                query: { _id: monitor.projectId._id || monitor.projectId },
                select: 'parentProjectId _id seats stripeSubscriptionId',
            });

            if (project) {
                if (project.parentProjectId) {
                    subProject = project;

                    project = await ProjectService.findOneBy({
                        query: { _id: subProject.parentProjectId },
                        select: '_id seats stripeSubscriptionId',
                    });
                }

                let subProjectIds: $TSFixMe = [];

                const subProjects: $TSFixMe = await ProjectService.findBy({
                    query: { parentProjectId: project._id },
                    select: '_id',
                });
                if (subProjects && subProjects.length > 0) {
                    subProjectIds = subProjects.map(
                        (project: $TSFixMe) => project._id
                    );
                }
                subProjectIds.push(project._id);
                const [monitorsCount, projectUsers]: $TSFixMe =
                    await Promise.all([
                        this.countBy({
                            projectId: { $in: subProjectIds },
                        }),
                        TeamService.getTeamMembersBy({
                            parentProjectId: project._id,
                        }),
                    ]);
                let projectSeats: $TSFixMe = project.seats;
                if (typeof projectSeats === 'string') {
                    projectSeats = parseInt(projectSeats);
                }
                const seats: $TSFixMe = await TeamService.getSeats(
                    projectUsers
                );
                // check if project seats are more based on users in project or by count of monitors
                if (
                    !IS_SAAS_SERVICE ||
                    (projectSeats &&
                        projectSeats > seats &&
                        monitorsCount > 0 &&
                        monitorsCount <= (projectSeats - 1) * 5)
                ) {
                    projectSeats = projectSeats - 1;
                    if (IS_SAAS_SERVICE) {
                        await PaymentService.changeSeats(
                            project.stripeSubscriptionId,
                            projectSeats
                        );
                    }
                    await ProjectService.updateOneBy(
                        { _id: project._id },
                        { seats: projectSeats.toString() }
                    );
                }
            }

            const alerts: $TSFixMe = await AlertService.findBy({
                query: { monitorId: monitor._id },
                select: '_id userId',
            });

            await Promise.all(
                alerts.map(async (alert: $TSFixMe) => {
                    await AlertService.deleteBy({ _id: alert._id }, userId);
                })
            );

            NotificationService.create(
                monitor.projectId,
                `A Monitor ${monitor.name} was deleted from the project by ${monitor.deletedById.name}`,
                monitor.deletedById._id,
                'monitoraddremove'
            );

            // run in the background
            // no need to delay request
            StatusPageService.removeMonitor(monitor._id);
            ScheduleService.removeMonitor(monitor._id);
            ScheduledEventService.removeMonitor(monitor._id, userId);
            IncomingRequestService.removeMonitor(monitor._id);
            IncidentService.removeMonitor(monitor._id, userId);
            IntegrationService.removeMonitor(monitor._id, userId);
            RealTimeService.sendMonitorDelete(monitor);

            return monitor;
        } else {
            return null;
        }
    }

    async getMonitorsBySubprojects(
        subProjectIds: $TSFixMe,
        limit: PositiveNumber,
        skip: PositiveNumber
    ): void {
        if (typeof limit === 'string') {
            limit = parseInt(limit);
        }
        if (typeof skip === 'string') {
            skip = parseInt(skip);
        }

        const select: $TSFixMe =
            '_id monitorStatus name slug statusPageCategory resourceCategory data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields siteUrls lighthouseScanStatus';
        const populate: $TSFixMe = [
            {
                path: 'monitorSla',
                select: 'frequency _id',
            },
            { path: 'componentId', select: 'name' },
            { path: 'incidentCommunicationSla', select: '_id' },
            { path: 'resourceCategory', select: 'name' },
            { path: 'statusPageCategory', select: 'name' },
            { path: 'projectId', select: 'name' },
        ];
        const subProjectMonitors: $TSFixMe = await Promise.all(
            subProjectIds.map(async (id: $TSFixMe) => {
                const [monitors, count]: $TSFixMe = await Promise.all([
                    this.findBy({
                        query: { projectId: id },
                        limit,
                        skip,
                        select,
                        populate,
                    }),
                    this.countBy({ projectId: id }),
                ]);

                const monitorsWithStatus: $TSFixMe = await Promise.all(
                    monitors.map(async (monitor: $TSFixMe) => {
                        let monitorStatus;

                        const incidentList: $TSFixMe = [];

                        const monitorIncidents: $TSFixMe =
                            await IncidentService.findBy({
                                query: {
                                    'monitors.monitorId': monitor._id,
                                    resolved: false,
                                },
                                select: 'incidentType',
                            });

                        for (const incident of monitorIncidents) {
                            incidentList.push(incident.incidentType);
                        }

                        if (monitor.disabled) {
                            monitorStatus = 'disabled';
                        } else if (incidentList.includes('offline')) {
                            monitorStatus = 'offline';
                        } else if (incidentList.includes('degraded')) {
                            monitorStatus = 'degraded';
                        } else {
                            monitorStatus = 'online';
                        }

                        return {
                            ...monitor,
                            status: monitorStatus,
                        };
                    })
                );

                const populateSchedule: $TSFixMe = [
                    { path: 'userIds', select: 'name' },
                    { path: 'createdById', select: 'name' },
                    { path: 'monitorIds', select: 'name' },
                    {
                        path: 'projectId',
                        select: '_id name slug',
                    },
                    {
                        path: 'escalationIds',
                        select: 'teams',
                        populate: {
                            path: 'teams.teamMembers.userId',
                            select: 'name email',
                        },
                    },
                ];

                const selectSchedule: $TSFixMe =
                    '_id name slug projectId createdById monitorsIds escalationIds createdAt isDefault userIds';
                const monitorsWithSchedules: $TSFixMe = await Promise.all(
                    monitorsWithStatus.map(async monitor => {
                        const monitorSchedules: $TSFixMe =
                            await ScheduleService.findBy({
                                query: { monitorIds: monitor._id },
                                select: selectSchedule,
                                populate: populateSchedule,
                            });
                        return {
                            ...monitor,
                            schedules: monitorSchedules,
                        };
                    })
                );

                return {
                    monitors: monitorsWithSchedules,
                    count,
                    _id: id,
                    skip,
                    limit,
                };
            })
        );
        return subProjectMonitors;
    }

    async getMonitorsBySubprojectsPaginate(
        projectId: ObjectID,
        componentId: $TSFixMe,
        limit: PositiveNumber,
        skip: PositiveNumber
    ): void {
        if (typeof limit === 'string') {
            limit = parseInt(limit);
        }
        if (typeof skip === 'string') {
            skip = parseInt(skip);
        }

        const select: $TSFixMe =
            '_id monitorStatus name slug resourceCategory data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields siteUrls lighthouseScanStatus';
        const populate: $TSFixMe = [
            {
                path: 'monitorSla',
                select: 'frequency _id',
            },
            { path: 'componentId', select: 'name' },
            { path: 'incidentCommunicationSla', select: '_id' },
            { path: 'resourceCategory', select: 'name' },
        ];

        const [monitors, count]: $TSFixMe = await Promise.all([
            this.findBy({
                query: { componentId },
                limit,
                skip,
                select,
                populate,
            }),
            this.countBy({ componentId }),
        ]);

        const monitorsWithStatus: $TSFixMe = await Promise.all(
            monitors.map(async (monitor: $TSFixMe) => {
                let monitorStatus;

                const incidentList: $TSFixMe = [];

                const monitorIncidents: $TSFixMe = await IncidentService.findBy(
                    {
                        query: {
                            'monitors.monitorId': monitor._id,
                            resolved: false,
                        },
                        select: 'incidentType',
                    }
                );

                for (const incident of monitorIncidents) {
                    incidentList.push(incident.incidentType);
                }

                if (monitor.disabled) {
                    monitorStatus = 'disabled';
                } else if (incidentList.includes('offline')) {
                    monitorStatus = 'offline';
                } else if (incidentList.includes('degraded')) {
                    monitorStatus = 'degraded';
                } else {
                    monitorStatus = 'online';
                }

                return {
                    ...monitor,
                    status: monitorStatus,
                };
            })
        );

        const populateSchedule: $TSFixMe = [
            { path: 'userIds', select: 'name' },
            { path: 'createdById', select: 'name' },
            { path: 'monitorIds', select: 'name' },
            {
                path: 'projectId',
                select: '_id name slug',
            },
            {
                path: 'escalationIds',
                select: 'teams',
                populate: {
                    path: 'teams.teamMembers.userId',
                    select: 'name email',
                },
            },
        ];

        const selectSchedule: $TSFixMe =
            '_id name slug projectId createdById monitorsIds escalationIds createdAt isDefault userIds';
        const monitorsWithSchedules: $TSFixMe = await Promise.all(
            monitorsWithStatus.map(async monitor => {
                const monitorSchedules: $TSFixMe = await ScheduleService.findBy(
                    {
                        query: { monitorIds: monitor._id },
                        select: selectSchedule,
                        populate: populateSchedule,
                    }
                );
                return {
                    ...monitor,
                    schedules: monitorSchedules,
                };
            })
        );

        return {
            monitors: monitorsWithSchedules,
            count,
            _id: projectId,
            skip,
            limit,
        };
    }

    async getProbeMonitors(probeId: $TSFixMe, date: $TSFixMe): void {
        const newdate: $TSFixMe = new Date();
        const monitors: $TSFixMe = await MonitorModel.find({
            $and: [
                {
                    deleted: false,
                    disabled: false,
                },
                {
                    $or: [
                        {
                            // This block only applies to server-monitors.
                            $and: [
                                {
                                    type: {
                                        $in: ['server-monitor'],
                                    },
                                },
                                {
                                    $or: [
                                        {
                                            pollTime: { $size: 0 },
                                        },
                                        {
                                            //Avoid monitors that has been pinged during the last interval of time.
                                            pollTime: {
                                                $not: {
                                                    $elemMatch: {
                                                        date: {
                                                            $gt: date,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            $and: [
                                {
                                    type: {
                                        $in: [
                                            'url',
                                            'api',
                                            'incomingHttpRequest',
                                            'kubernetes',
                                            'ip',
                                        ],
                                    },
                                },
                                {
                                    $or: [
                                        {
                                            pollTime: {
                                                $elemMatch: {
                                                    probeId,
                                                    date: { $lt: date },
                                                },
                                            },
                                        },
                                        {
                                            //pollTime doesn't include the probeId yet.
                                            pollTime: {
                                                $not: {
                                                    $elemMatch: {
                                                        probeId,
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (monitors && monitors.length) {
            const updatePromises: $TSFixMe = [];
            const createNewPollTimeMonitorIds: $TSFixMe = [];
            const updatePollTimeMonitorIds: $TSFixMe = [];

            for (const monitor of monitors) {
                if (
                    monitor.pollTime.length === 0 ||
                    !monitor.pollTime.some(
                        (pt: $TSFixMe) => String(pt.probeId) === String(probeId)
                    )
                ) {
                    createNewPollTimeMonitorIds.push(monitor._id);
                } else {
                    updatePollTimeMonitorIds.push(monitor._id);
                }
            }

            updatePromises.push(
                MonitorModel.updateMany(
                    { _id: { $in: createNewPollTimeMonitorIds } },
                    {
                        $push: {
                            pollTime: { probeId, date: newdate },
                        },
                    }
                )
            );

            updatePromises.push(
                MonitorModel.updateMany(
                    {
                        _id: { $in: updatePollTimeMonitorIds },
                        pollTime: {
                            $elemMatch: {
                                probeId,
                            },
                        },
                    },
                    { $set: { 'pollTime.$.date': newdate } }
                )
            );

            await Promise.all(updatePromises);

            return monitors;
        } else {
            return [];
        }
    }

    async getScriptMonitors({ limit, skip }: $TSFixMe): void {
        import moment from 'moment';
        const monitors: $TSFixMe = await MonitorModel.find({
            $and: [
                {
                    deleted: false,
                    disabled: false,
                    type: 'script',
                },
                {
                    $or: [
                        {
                            // ignore scripts that are running / inProgress
                            scriptRunStatus: {
                                $nin: ['inProgress'],
                            },
                        },
                        // runaway script monitors that have been running for too long (10mins)**
                        // or weren't completed due to a crash
                        {
                            lastPingTime: {
                                $lte: moment().subtract(10, 'minutes').toDate(),
                            },
                        },
                    ],
                },
            ],
        })
            .limit(limit.toNumber())
            .skip(skip.toNumber());

        // update state of selected script monitors to inProgress
        if (monitors && monitors.length) {
            await monitors.map(async (m: $TSFixMe) => {
                if (m.type === 'script') {
                    await MonitorModel.updateOne(
                        { _id: m._id, deleted: false },
                        { $set: { scriptRunStatus: 'inProgress' } },
                        { multi: true }
                    );
                }
                return m;
            });

            return monitors;
        } else {
            return [];
        }
    }

    async getUrlMonitorsNotScannedByLightHouseInPastOneDay(): void {
        const oneDay: $TSFixMe = moment().subtract(1, 'days').toDate();

        const monitors: $TSFixMe = await MonitorModel.find({
            $and: [
                {
                    deleted: false,
                    disabled: false,
                    type: 'url',
                },
                {
                    $or: [
                        {
                            lighthouseScanStatus: {
                                $exists: false, // Lighthouse scan status does not exist
                            },
                        },
                        {
                            lighthouseScanStatus: {
                                $exists: true,
                                $nin: ['scanning', 'scanned'], // Lighthouse scan status exist but 'failed' or the 'scan' button is clicked from UI
                            },
                        },
                        { lighthouseScannedAt: { $lt: oneDay } },
                    ],
                },
            ],
        });

        return monitors;
    }

    async updateMonitorPingTime(id: $TSFixMe): void {
        const newdate: $TSFixMe = new Date();

        const monitor: $TSFixMe = await MonitorModel.findOneAndUpdate(
            {
                _id: id,
            },
            { $set: { lastPingTime: newdate } }
        );

        return monitor;
    }

    async updateDeviceMonitorPingTime(
        projectId: ObjectID,
        deviceId: $TSFixMe
    ): void {
        const thisObj: $TSFixMe = this;
        let monitor: $TSFixMe = await thisObj.findOneBy({
            query: { projectId: projectId, data: { deviceId: deviceId } },
            select: '_id',
        });

        if (!monitor) {
            const error: $TSFixMe = new Error(
                'Monitor with this Device ID not found in this Project.'
            );

            error.code = 400;
            throw error;
        } else {
            monitor = await thisObj.updateMonitorPingTime(monitor._id);
            return monitor;
        }
    }

    async getMonitorLogs(
        monitorId: $TSFixMe,
        startDate: $TSFixMe,
        endDate: $TSFixMe
    ): void {
        const start: $TSFixMe = moment(startDate).toDate();
        const end: $TSFixMe = moment(endDate).toDate();
        const intervalInDays: $TSFixMe = moment(endDate).diff(
            moment(startDate),
            'days'
        );

        await this.updateMonitorSlaStat({ _id: monitorId });

        const select: string = 'type agentlessConfig createdAt';
        const monitor: $TSFixMe = await this.findOneBy({
            query: { _id: monitorId },
            select,
        });

        let probes;
        const probeLogs: $TSFixMe = [];
        if (monitor) {
            const isNewMonitor: $TSFixMe =
                moment(endDate).diff(moment(monitor.createdAt), 'days') < 2;
            if (monitor.type === 'server-monitor' && !monitor.agentlessConfig) {
                probes = [undefined];
            } else {
                probes = await ProbeService.findBy({
                    query: {},
                    select: '_id',
                });
            }

            const selectMonitorLogBy: $TSFixMe =
                'monitorId probeId status responseTime responseStatus cpuLoad avgCpuLoad cpuCores memoryUsed totalMemory swapUsed storageUsed totalStorage storageUsage mainTemp maxTemp createdAt intervalDate maxResponseTime maxCpuLoad maxMemoryUsed maxStorageUsed maxMainTemp sslCertificate kubernetesLog';

            const selectMonitorLog: $TSFixMe =
                'monitorId probeId status responseTime responseStatus responseBody responseHeader cpuLoad avgCpuLoad cpuCores memoryUsed totalMemory swapUsed storageUsed totalStorage storageUsage mainTemp maxTemp incidentIds createdAt sslCertificate  kubernetesLog scriptMetadata';

            const populateMonitorLog: $TSFixMe = [
                {
                    path: 'probeId',
                    select: 'createdAt lastAlive probeKey probeName version probeImage deleted',
                },
            ];

            for (const probe of probes) {
                const query: $TSFixMe = {
                    monitorId,
                    createdAt: { $gte: start, $lte: end },
                };
                if (typeof probe !== 'undefined') {
                    query.probeId = probe._id;
                }

                let monitorLogs;

                if (intervalInDays > 30 && !isNewMonitor) {
                    monitorLogs = await MonitorLogByWeekService.findBy({
                        query,
                        select: selectMonitorLogBy,
                    });
                } else if (intervalInDays > 2 && !isNewMonitor) {
                    monitorLogs = await MonitorLogByDayService.findBy({
                        query,
                        select: selectMonitorLogBy,
                    });
                } else {
                    if (
                        moment(endDate).diff(
                            moment(monitor.createdAt),
                            'minutes'
                        ) > 60
                    ) {
                        monitorLogs = await MonitorLogByHourService.findBy({
                            query,
                            select: selectMonitorLogBy,
                        });
                    } else {
                        monitorLogs = await MonitorLogService.findBy({
                            query,
                            select: selectMonitorLog,
                            populate: populateMonitorLog,
                        });
                    }
                }

                if (monitorLogs && monitorLogs.length > 0) {
                    probeLogs.push({
                        _id: typeof probe !== 'undefined' ? probe._id : null,
                        logs: monitorLogs,
                    });
                }
            }
        }

        return probeLogs;
    }

    async getMonitorLogsByDay(
        monitorId: $TSFixMe,
        startDate: $TSFixMe,
        endDate: $TSFixMe,
        filter: $TSFixMe
    ): void {
        const start: $TSFixMe = moment(startDate).toDate();
        const end: $TSFixMe = moment(endDate).toDate();
        const monitor: $TSFixMe = await this.findOneBy({
            query: { _id: monitorId },
            select: 'type agentlessConfig',
        });
        let probes;
        if (monitor.type === 'server-monitor' && !monitor.agentlessConfig) {
            probes = [undefined];
        } else {
            probes = await ProbeService.findBy({
                query: {},
                select: '_id',
            });
        }

        const selectMonitorLogBy: $TSFixMe =
            'monitorId probeId status responseTime responseStatus cpuLoad avgCpuLoad cpuCores memoryUsed totalMemory swapUsed storageUsed totalStorage storageUsage mainTemp maxTemp createdAt intervalDate maxResponseTime maxCpuLoad maxMemoryUsed maxStorageUsed maxMainTemp sslCertificate kubernetesLog';

        const probeLogs: $TSFixMe = [];
        for (const probe of probes) {
            const query: $TSFixMe = {
                monitorId,
                createdAt: { $gte: start, $lte: end },
            };
            if (typeof probe !== 'undefined') {
                query.probeId = probe._id;
            }
            const monitorLogs: $TSFixMe = await MonitorLogByDayService.findBy({
                query,
                limit: null,
                skip: null,
                filter,
                select: selectMonitorLogBy,
            });
            if (monitorLogs && monitorLogs.length > 0) {
                probeLogs.push({
                    _id: typeof probe !== 'undefined' ? probe._id : null,
                    logs: monitorLogs,
                });
            }
        }
        return probeLogs;
    }

    async getMonitorStatuses(
        monitorId: $TSFixMe,
        startDate: $TSFixMe,
        endDate: $TSFixMe
    ): void {
        const start: $TSFixMe = moment(startDate).toDate();
        const end: $TSFixMe = moment(endDate).toDate();
        const monitor: $TSFixMe = await this.findOneBy({
            query: { _id: monitorId },
            select: 'type agentlessConfig',
        });

        let probes;
        const probeStatuses: $TSFixMe = [];
        if (
            (monitor &&
                monitor.type === 'server-monitor' &&
                !monitor.agentlessConfig) ||
            (monitor && monitor.type === 'manual')
        ) {
            probes = [undefined];
        } else {
            probes = await ProbeService.findBy({
                query: {},
                select: '_id',
            });
        }

        for (const probe of probes) {
            const query: $TSFixMe = {
                monitorId,
                $and: [
                    { startTime: { $lte: end } },
                    {
                        $or: [
                            { endTime: { $gte: start } },
                            { endTime: null },
                            { endTime: { $exists: false } },
                        ],
                    },
                ],
            };
            if (typeof probe !== 'undefined') {
                // return manually created statuses in every probe

                query.probeId = { $in: [probe._id, null] };
            }

            const select: $TSFixMe =
                '_id monitorId probeId incidentId status manuallyCreated startTime endTime lastStatus createdAt deleted';
            const monitorStatuses: $TSFixMe = await MonitorStatusService.findBy(
                {
                    query,
                    select,
                }
            );

            if (monitorStatuses && monitorStatuses.length > 0) {
                probeStatuses.push({
                    _id: typeof probe !== 'undefined' ? probe._id : null,
                    statuses: monitorStatuses,
                });
            }
        }

        return probeStatuses;
    }

    async addSeat(query: Query): void {
        const project: $TSFixMe = await ProjectService.findOneBy({
            query,
            select: 'seats stripeSubscriptionId _id',
        });
        let projectSeats: $TSFixMe = project.seats;
        if (typeof projectSeats === 'string') {
            projectSeats = parseInt(projectSeats);
        }
        projectSeats = projectSeats + 1;
        if (IS_SAAS_SERVICE) {
            await PaymentService.changeSeats(
                project.stripeSubscriptionId,
                projectSeats
            );
        }
        await ProjectService.updateOneBy(
            { _id: project._id },
            { seats: String(projectSeats) }
        );
        return 'A new seat added. Now you can add a monitor';
    }

    async addSiteUrl(query: Query, data: $TSFixMe): void {
        let monitor: $TSFixMe = await this.findOneBy({
            query,
            select: 'siteUrls',
        });

        if (
            monitor.siteUrls &&
            monitor.siteUrls.length > 0 &&
            monitor.siteUrls.includes(data.siteUrl)
        ) {
            throw new BadDataException('Site URL already exists.');
        }

        const siteUrls: $TSFixMe = [data.siteUrl, ...monitor.siteUrls];

        monitor = await this.updateOneBy(query, { siteUrls });

        return monitor;
    }

    async removeSiteUrl(query: Query, data: $TSFixMe): void {
        let monitor: $TSFixMe = await this.findOneBy({
            query,
            select: 'siteUrls',
        });
        const siteUrlIndex: $TSFixMe =
            monitor.siteUrls && monitor.siteUrls.length > 0
                ? monitor.siteUrls.indexOf(data.siteUrl)
                : -1;

        if (siteUrlIndex === -1) {
            throw new BadDataException('Site URL does not exist.');
        }

        if (monitor.siteUrls && monitor.siteUrls.length > 0) {
            monitor.siteUrls.splice(siteUrlIndex, 1);
        }
        const siteUrls: $TSFixMe = monitor.siteUrls;

        monitor = await this.updateOneBy(query, { siteUrls });

        return monitor;
    }

    // yet to be edited
    async getManualMonitorTime(monitorId: $TSFixMe): void {
        const [monitorTime, monitorIncidents]: $TSFixMe = await Promise.all([
            this.findOneBy({
                query: { _id: monitorId },
                select: 'createdAt',
            }),
            IncidentService.findBy({
                query: { 'monitors.monitorId': monitorId },
                select: 'createdAt resolvedAt',
            }),
        ]);
        const dateNow: $TSFixMe = moment().utc();
        let days: $TSFixMe = moment(dateNow)
            .utc()
            .startOf('day')
            .diff(moment(monitorTime.createdAt).utc().startOf('day'), 'days');

        if (days > 89) {
            days = 89;
        }
        const times: $TSFixMe = [];
        for (let i: $TSFixMe = days; i >= 0; i--) {
            let incidents: $TSFixMe = [];
            const temp: $TSFixMe = {};
            let status: $TSFixMe = 'online';

            temp.date = moment(dateNow).utc().subtract(i, 'days');

            temp.monitorId = monitorId;
            if (monitorIncidents && monitorIncidents.length) {
                incidents = monitorIncidents.filter((inc: $TSFixMe) => {
                    const creatediff: $TSFixMe = moment(temp.date)
                        .utc()
                        .startOf('day')
                        .diff(
                            moment(inc.createdAt).utc().startOf('day'),
                            'days'
                        );

                    const resolveddiff: $TSFixMe = moment(temp.date)
                        .utc()
                        .startOf('day')
                        .diff(
                            moment(inc.resolvedAt).utc().startOf('day'),
                            'days'
                        );
                    if (creatediff > -1 && resolveddiff < 1) {
                        return true;
                    } else {
                        return false;
                    }
                });
                status = incidents.some((inc: $TSFixMe) =>
                    inc.resolvedAt
                        ? moment(inc.resolvedAt)
                              .utc()
                              .startOf('day')
                              .diff(
                                  moment(temp.date).utc().startOf('day'),
                                  'days'
                              ) > 0
                        : true
                )
                    ? 'offline'
                    : 'online';

                incidents = incidents.map((inc: $TSFixMe) => {
                    const creatediff: $TSFixMe = moment(temp.date)
                        .utc()
                        .startOf('day')
                        .diff(
                            moment(inc.createdAt).utc().startOf('day'),
                            'days'
                        );
                    const resolveddiff: $TSFixMe = inc.resolvedAt
                        ? moment(temp.date)
                              .utc()
                              .startOf('day')
                              .diff(
                                  moment(inc.resolvedAt).utc().startOf('day'),
                                  'days'
                              )
                        : moment(temp.date)
                              .utc()
                              .startOf('day')
                              .diff(moment().utc().startOf('day'), 'days');
                    if (creatediff > 0 && resolveddiff < 0) {
                        return 1440;
                    } else if (creatediff === 0 && resolveddiff !== 0) {
                        return moment(temp.date)
                            .utc()
                            .endOf('day')
                            .diff(moment(inc.createdAt).utc(), 'minutes');
                    } else if (creatediff !== 0 && resolveddiff === 0) {
                        return moment(temp.date)
                            .utc()
                            .startOf('day')
                            .diff(moment(inc.resolvedAt).utc(), 'minutes');
                    } else if (creatediff === 0 && resolveddiff === 0) {
                        return moment(temp.resolvedAt)
                            .utc()
                            .diff(moment(inc.createdAt).utc(), 'minutes');
                    }
                    return null;
                });
            }
            if (incidents.length) {
                const reduced: $TSFixMe = incidents.reduce(
                    (inc: $TSFixMe, val: $TSFixMe) => inc + val
                );

                temp.downTime = reduced < 1440 ? reduced : 1440;

                temp.upTime = reduced < 1440 ? 1440 - reduced : 0;
            } else {
                temp.downTime = 0;

                temp.upTime = 1440;
            }

            temp.status = status;
            times.unshift(temp);
        }
        return times;
    }

    async restoreBy(query: Query): void {
        query.deleted = true;
        const select: string = '_id';
        const monitor: $TSFixMe = await this.findBy({ query, select });
        if (monitor && monitor.length > 0) {
            const monitors: $TSFixMe = await Promise.all(
                monitor.map(async (monitor: $TSFixMe) => {
                    const monitorId: $TSFixMe = monitor._id;

                    monitor = await this.updateOneBy(
                        { _id: monitorId, deleted: true },
                        {
                            deleted: false,
                            deletedAt: null,
                            deleteBy: null,
                        }
                    );
                    await Promise.all([
                        IncidentService.restoreBy({
                            'monitors.monitorId': monitorId,
                            deleted: true,
                        }),
                        AlertService.restoreBy({
                            monitorId,
                            deleted: true,
                        }),
                    ]);
                    return monitor;
                })
            );
            return monitors;
        }
    }

    // checks if the monitor uptime stat is within the defined uptime on monitor sla
    // then update the monitor => breachedMonitorSla
    async updateMonitorSlaStat(query: Query): void {
        const currentDate: $TSFixMe = moment().format();
        let startDate: $TSFixMe = moment(currentDate).subtract(30, 'days'); // default frequency
        const populate: $TSFixMe = [
            { path: 'monitorSla', select: 'frequency monitorUptime' },
        ];
        const monitor: $TSFixMe = await this.findOneBy({
            query,
            select: '_id monitorSla projectId',
            populate,
        });
        if (monitor) {
            // eslint-disable-next-line prefer-const
            let { monitorSla, projectId } = monitor;

            if (!monitorSla) {
                monitorSla = await MonitorSlaService.findOneBy({
                    query: {
                        projectId: projectId._id || projectId,
                        isDefault: true,
                    },
                    select: 'frequency monitorUptime',
                });
            }

            if (monitorSla) {
                startDate = moment(currentDate)
                    .subtract(Number(monitorSla.frequency), 'days')
                    .format();

                const monitorStatus: $TSFixMe = await this.getMonitorStatuses(
                    monitor._id,
                    startDate,
                    currentDate
                );
                if (monitorStatus && monitorStatus.length > 0) {
                    const { uptimePercent }: $TSFixMe =
                        await this.calculateTime(
                            monitorStatus[0].statuses,
                            startDate,
                            Number(monitorSla.frequency)
                        );

                    const monitorUptime: $TSFixMe =
                        uptimePercent !== 100 && !isNaN(uptimePercent)
                            ? uptimePercent.toFixed(3)
                            : '100';
                    const slaUptime: $TSFixMe = Number(
                        monitorSla.monitorUptime
                    ).toFixed(3);

                    if (Number(monitorUptime) < Number(slaUptime)) {
                        // monitor sla is breached for this monitor
                        await MonitorModel.updateOne(
                            { _id: monitor._id },
                            { $set: { breachedMonitorSla: true } }
                        );
                    } else {
                        await MonitorModel.updateOne(
                            { _id: monitor._id },
                            { $set: { breachedMonitorSla: false } }
                        );
                    }
                }

                const select: $TSFixMe =
                    '_id monitorStatus name slug statusPageCategory resourceCategory data type monitorSla breachedMonitorSla breachClosedBy componentId projectId incidentCommunicationSla criteria agentlessConfig lastPingTime lastMatchedCriterion method bodyType formData text headers disabled pollTime updateTime customFields siteUrls lighthouseScanStatus';
                const populate: $TSFixMe = [
                    {
                        path: 'monitorSla',
                        select: 'frequency _id',
                    },
                    { path: 'componentId', select: 'name' },
                    { path: 'incidentCommunicationSla', select: '_id' },
                    { path: 'resourceCategory', select: 'name' },
                    { path: 'statusPageCategory', select: 'name' },
                ];

                const monitorData: $TSFixMe = await this.findOneBy({
                    query: { _id: monitor._id },
                    select,
                    populate,
                });
                // run in the background
                RealTimeService.monitorEdit(monitorData);
            }
        }
    }

    calculateTime(statuses: $TSFixMe, start: $TSFixMe, range: $TSFixMe): void {
        const timeBlock: $TSFixMe = [];
        let totalUptime: $TSFixMe = 0;
        let totalTime: $TSFixMe = 0;

        let dayStart: $TSFixMe = moment(start).startOf('day');

        const reversedStatuses: $TSFixMe = statuses.slice().reverse();

        for (let i: $TSFixMe = 0; i < range; i++) {
            const dayStartIn: $TSFixMe = dayStart;
            const dayEnd: $TSFixMe =
                i && i > 0 ? dayStart.clone().endOf('day') : moment(Date.now());

            const timeObj: $TSFixMe = {
                date: dayStart.toISOString(),
                downTime: 0,
                upTime: 0,
                degradedTime: 0,
            };
            /**
             * If two incidents of the same time overlap, we merge them
             * If two incidents of different type overlap, The priority will be:
             * offline, degraded and online.
             *      if the less important incident starts after and finish before the other incident, we remove it.
             *      if the less important incident overlaps with the other incident, we update its start/end time.
             *      if the less important incident start before and finish after the other incident, we divide it into two parts
             *          the first part ends before the important incident,
             *          the second part start after the important incident.
             * The time report will be generate after the following steps:
             * 1- selecting the incident that happendend during the selected day.
             *   In other words: The incidents that overlap with `dayStartIn` and `dayEnd`.
             * 2- Sorting them, to reduce the complexity of the next step (https://www.geeksforgeeks.org/merging-intervals/).
             * 3- Checking for overlaps between incidents. Merge incidents of the same type, reduce the time of the less important incidents.
             * 4- Fill the timeObj
             */
            //First step
            let incidentsHappenedDuringTheDay: $TSFixMe = [];
            reversedStatuses.forEach((monitorStatus: $TSFixMe) => {
                if (monitorStatus.endTime === null) {
                    monitorStatus.endTime = new Date().toISOString();
                }

                if (
                    moment(monitorStatus.startTime).isBefore(dayEnd) &&
                    moment(monitorStatus.endTime).isAfter(dayStartIn)
                ) {
                    const start: $TSFixMe = moment(
                        monitorStatus.startTime
                    ).isBefore(dayStartIn)
                        ? dayStartIn
                        : moment(monitorStatus.startTime);
                    const end: $TSFixMe = moment(monitorStatus.endTime).isAfter(
                        dayEnd
                    )
                        ? dayEnd
                        : moment(monitorStatus.endTime);
                    incidentsHappenedDuringTheDay.push({
                        start,
                        end,
                        status: monitorStatus.status,
                    });
                }
            });
            //Second step

            incidentsHappenedDuringTheDay.sort((a, b) =>
                moment(a.start).isSame(b.start)
                    ? 0
                    : moment(a.start).isAfter(b.start)
                    ? 1
                    : -1
            );
            //Third step
            for (
                let i: $TSFixMe = 0;
                i < incidentsHappenedDuringTheDay.length - 1;
                i++
            ) {
                const firstIncidentIndex: $TSFixMe = i;
                const nextIncidentIndex: $TSFixMe = i + 1;
                const firstIncident: $TSFixMe =
                    incidentsHappenedDuringTheDay[firstIncidentIndex];
                const nextIncident: $TSFixMe =
                    incidentsHappenedDuringTheDay[nextIncidentIndex];
                if (
                    moment(firstIncident.end).isSameOrBefore(nextIncident.start)
                ) {
                    continue;
                }

                if (firstIncident.status === nextIncident.status) {
                    const end: $TSFixMe = moment(firstIncident.end).isAfter(
                        nextIncident.end
                    )
                        ? firstIncident.end
                        : nextIncident.end;
                    firstIncident.end = end;
                    incidentsHappenedDuringTheDay.splice(nextIncidentIndex, 1);
                } else {
                    //if the firstIncident has a higher priority
                    if (
                        firstIncident.status === 'offline' ||
                        (firstIncident.status === 'degraded' &&
                            nextIncident.status === 'online')
                    ) {
                        if (
                            moment(firstIncident.end).isAfter(nextIncident.end)
                        ) {
                            incidentsHappenedDuringTheDay.splice(
                                nextIncidentIndex,
                                1
                            );
                        } else {
                            nextIncident.start = firstIncident.end;
                            //we will need to shift the next incident to keep the array sorted.
                            incidentsHappenedDuringTheDay.splice(
                                nextIncidentIndex,
                                1
                            );
                            let j: $TSFixMe = nextIncidentIndex;
                            while (j < incidentsHappenedDuringTheDay.length) {
                                if (
                                    moment(nextIncident.start).isBefore(
                                        incidentsHappenedDuringTheDay[j].start
                                    )
                                ) {
                                    break;
                                }
                                j += 1;
                            }
                            incidentsHappenedDuringTheDay.splice(
                                j,
                                0,
                                nextIncident
                            );
                        }
                    } else {
                        if (
                            moment(firstIncident.end).isBefore(nextIncident.end)
                        ) {
                            firstIncident.end = nextIncident.start;
                        } else {
                            /**
                             * The firstIncident is less important than the next incident,
                             * it also starts before and ends after the nextIncident.
                             * In the case The first incident needs to be devided into to two parts.
                             * The first part comes before the nextIncident,
                             * the second one comes after the nextIncident.
                             */
                            const newIncident: $TSFixMe = {
                                start: nextIncident.end,
                                end: firstIncident.end,
                                status: firstIncident.status,
                            };
                            firstIncident.end = nextIncident.start;
                            let j: $TSFixMe = nextIncidentIndex + 1;
                            while (j < incidentsHappenedDuringTheDay.length) {
                                if (
                                    moment(newIncident.start).isBefore(
                                        incidentsHappenedDuringTheDay[j].start
                                    )
                                ) {
                                    break;
                                }
                                j += 1;
                            }
                            incidentsHappenedDuringTheDay.splice(
                                j,
                                0,
                                newIncident
                            );
                        }
                    }
                }
                i--;
            }
            //Remove events having start and end time equal.
            incidentsHappenedDuringTheDay =
                incidentsHappenedDuringTheDay.filter(
                    event => !moment(event.start).isSame(event.end)
                );
            //Last step
            for (const incident of incidentsHappenedDuringTheDay) {
                const { start, end, status }: $TSFixMe = incident;
                if (status === 'offline') {
                    timeObj.downTime =
                        timeObj.downTime + end.diff(start, 'seconds');
                    timeObj.date = end.toISOString();
                }
                if (status === 'degraded') {
                    timeObj.degradedTime =
                        timeObj.degradedTime + end.diff(start, 'seconds');
                }
                if (status === 'online') {
                    timeObj.upTime =
                        timeObj.upTime + end.diff(start, 'seconds');
                }
            }

            totalUptime = totalUptime + timeObj.upTime;
            totalTime =
                totalTime +
                timeObj.upTime +
                timeObj.degradedTime +
                timeObj.downTime;

            timeBlock.push(Object.assign({}, timeObj));

            dayStart = dayStart.subtract(1, 'days');
        }

        return { timeBlock, uptimePercent: (totalUptime / totalTime) * 100 };
    }

    async closeBreachedMonitorSla(
        projectId: ObjectID,
        monitorId: $TSFixMe,
        userId: ObjectID
    ): void {
        const monitor: $TSFixMe = await MonitorModel.findOneAndUpdate(
            {
                _id: monitorId,
                projectId,
                breachedMonitorSla: true,
                deleted: false,
            },
            {
                $push: { breachClosedBy: userId },
            },
            { new: true }
        );

        return monitor;
    }

    async changeMonitorComponent(
        projectId: ObjectID,
        monitorId: $TSFixMe,
        componentId: $TSFixMe
    ): void {
        const [monitor, component]: $TSFixMe = await Promise.all([
            this.findOneBy({
                query: { _id: monitorId },
                select: 'projectId slug',
            }),
            componentService.findOneBy({
                query: { _id: componentId },
                select: 'projectId slug',
            }),
        ]);

        // ensure monitor and component belong to same project
        if (
            String(monitor.projectId) !== String(projectId) ||
            String(component.projectId) !== String(projectId)
        ) {
            throw new Error(
                'Monitor and component do not belong to the same project or sub-project'
            );
        }

        const updatedMonitor: $TSFixMe = await this.updateOneBy(
            { _id: monitorId },
            { componentId }
        );

        return updatedMonitor;
    }

    calcTime(statuses: $TSFixMe, start: $TSFixMe, range: $TSFixMe): void {
        const timeBlock: $TSFixMe = [];
        let totalUptime: $TSFixMe = 0;
        let totalTime: $TSFixMe = 0;

        let dayStart: $TSFixMe = moment(start).startOf('day');

        const reversedStatuses: $TSFixMe = statuses.slice().reverse();

        for (let i: $TSFixMe = 0; i < range; i++) {
            const dayStartIn: $TSFixMe = dayStart;
            const dayEnd: $TSFixMe =
                i && i > 0 ? dayStart.clone().endOf('day') : moment(Date.now());

            const timeObj: $TSFixMe = {
                date: dayStart.toISOString(),
                downTime: 0,
                upTime: 0,
                degradedTime: 0,
                disabledTime: 0,
                status: null,
                emptytime: dayStart.toISOString(),
            };
            /**
             * If two incidents of the same time overlap, we merge them
             * If two incidents of different type overlap, The priority will be:
             * offline, degraded and online.
             *      if the less important incident starts after and finish before the other incident, we remove it.
             *      if the less important incident overlaps with the other incident, we update its start/end time.
             *      if the less important incident start before and finish after the other incident, we divide it into two parts
             *          the first part ends before the important incident,
             *          the second part start after the important incident.
             * The time report will be generate after the following steps:
             * 1- selecting the incident that happendend during the selected day.
             *   In other words: The incidents that overlap with `dayStartIn` and `dayEnd`.
             * 2- Sorting them, to reduce the complexity of the next step (https://www.geeksforgeeks.org/merging-intervals/).
             * 3- Checking for overlaps between incidents. Merge incidents of the same type, reduce the time of the less important incidents.
             * 4- Fill the timeObj
             */
            //First step
            let incidentsHappenedDuringTheDay: $TSFixMe = [];
            reversedStatuses.forEach(
                (monitor: $TSFixMe, index: $TSFixMe, array: $TSFixMe) => {
                    const monitorStatus: $TSFixMe = Object.assign({}, monitor);
                    if (
                        monitorStatus.endTime === null &&
                        index === array.length - 1
                    ) {
                        // only set this for the last item in the array (current monitor status)
                        monitorStatus.endTime = new Date().toISOString();
                    }

                    if (
                        moment(monitorStatus.startTime).isBefore(dayEnd) &&
                        moment(monitorStatus.endTime).isAfter(dayStartIn)
                    ) {
                        if (
                            monitor.endTime === null &&
                            (monitor.status === 'offline' ||
                                (monitorStatus.status === 'degraded' &&
                                    timeObj.status !== 'offline') ||
                                timeObj.status === null)
                        ) {
                            timeObj.status = monitorStatus.status;
                        }

                        if (
                            monitor.endTime === null &&
                            monitor.status === 'disabled'
                        ) {
                            timeObj.status = monitor.status;
                        }
                        const start: $TSFixMe = moment(
                            monitorStatus.startTime
                        ).isBefore(dayStartIn)
                            ? dayStartIn
                            : moment(monitorStatus.startTime);
                        const end: $TSFixMe = moment(
                            monitorStatus.endTime
                        ).isAfter(dayEnd)
                            ? dayEnd
                            : moment(monitorStatus.endTime);

                        incidentsHappenedDuringTheDay.push({
                            start,
                            end,
                            status: monitorStatus.status,
                        });

                        timeObj.date = end.toISOString();

                        timeObj.emptytime = null;
                    }
                }
            );
            //Second step

            incidentsHappenedDuringTheDay.sort((a, b) =>
                moment(a.start).isSame(b.start)
                    ? 0
                    : moment(a.start).isAfter(b.start)
                    ? 1
                    : -1
            );
            //Third step
            for (
                let i: $TSFixMe = 0;
                i < incidentsHappenedDuringTheDay.length - 1;
                i++
            ) {
                const firstIncidentIndex: $TSFixMe = i;
                const nextIncidentIndex: $TSFixMe = i + 1;
                const firstIncident: $TSFixMe =
                    incidentsHappenedDuringTheDay[firstIncidentIndex];
                const nextIncident: $TSFixMe =
                    incidentsHappenedDuringTheDay[nextIncidentIndex];
                if (
                    moment(firstIncident.end).isSameOrBefore(nextIncident.start)
                ) {
                    continue;
                }

                if (firstIncident.status === nextIncident.status) {
                    const end: $TSFixMe = moment(firstIncident.end).isAfter(
                        nextIncident.end
                    )
                        ? firstIncident.end
                        : nextIncident.end;
                    firstIncident.end = end;
                    incidentsHappenedDuringTheDay.splice(nextIncidentIndex, 1);
                } else {
                    //if the firstIncident has a higher priority
                    if (
                        firstIncident.status === 'disabled' ||
                        (firstIncident.status === 'offline' &&
                            nextIncident.status !== 'disabled') ||
                        (firstIncident.status === 'degraded' &&
                            nextIncident.status === 'online')
                    ) {
                        if (
                            moment(firstIncident.end).isAfter(nextIncident.end)
                        ) {
                            incidentsHappenedDuringTheDay.splice(
                                nextIncidentIndex,
                                1
                            );
                        } else {
                            nextIncident.start = firstIncident.end;
                            //we will need to shift the next incident to keep the array sorted.
                            incidentsHappenedDuringTheDay.splice(
                                nextIncidentIndex,
                                1
                            );
                            let j: $TSFixMe = nextIncidentIndex;
                            while (j < incidentsHappenedDuringTheDay.length) {
                                if (
                                    moment(nextIncident.start).isBefore(
                                        incidentsHappenedDuringTheDay[j].start
                                    )
                                ) {
                                    break;
                                }
                                j += 1;
                            }
                            incidentsHappenedDuringTheDay.splice(
                                j,
                                0,
                                nextIncident
                            );
                        }
                    } else {
                        if (
                            moment(firstIncident.end).isBefore(nextIncident.end)
                        ) {
                            firstIncident.end = nextIncident.start;
                        } else {
                            /**
                             * The firstIncident is less important than the next incident,
                             * it also starts before and ends after the nextIncident.
                             * In the case The first incident needs to be devided into to two parts.
                             * The first part comes before the nextIncident,
                             * the second one comes after the nextIncident.
                             */
                            const newIncident: $TSFixMe = {
                                start: nextIncident.end,
                                end: firstIncident.end,
                                status: firstIncident.status,
                            };
                            firstIncident.end = nextIncident.start;
                            let j: $TSFixMe = nextIncidentIndex + 1;
                            while (j < incidentsHappenedDuringTheDay.length) {
                                if (
                                    moment(newIncident.start).isBefore(
                                        incidentsHappenedDuringTheDay[j].start
                                    )
                                ) {
                                    break;
                                }
                                j += 1;
                            }
                            incidentsHappenedDuringTheDay.splice(
                                j,
                                0,
                                newIncident
                            );
                        }
                    }
                }
                i--;
            }
            //Remove events having start and end time equal.
            incidentsHappenedDuringTheDay =
                incidentsHappenedDuringTheDay.filter(
                    event => !moment(event.start).isSame(event.end)
                );
            //Last step
            for (const incident of incidentsHappenedDuringTheDay) {
                const { start, end, status }: $TSFixMe = incident;
                if (status === 'disabled') {
                    timeObj.disabledTime =
                        timeObj.disabledTime + end.diff(start, 'seconds');
                    timeObj.date = end.toISOString();
                }
                if (status === 'offline') {
                    timeObj.downTime =
                        timeObj.downTime + end.diff(start, 'seconds');
                    timeObj.date = end.toISOString();
                }
                if (status === 'degraded') {
                    timeObj.degradedTime =
                        timeObj.degradedTime + end.diff(start, 'seconds');
                }
                if (status === 'online') {
                    timeObj.upTime =
                        timeObj.upTime + end.diff(start, 'seconds');
                }
            }

            totalUptime = totalUptime + timeObj.upTime;
            totalTime =
                totalTime +
                timeObj.upTime +
                timeObj.degradedTime +
                timeObj.downTime +
                timeObj.disabledTime;
            if (timeObj.status === null || timeObj.status === 'online') {
                if (timeObj.disabledTime > 0) {
                    timeObj.status = 'disabled';
                } else if (timeObj.downTime > 0) {
                    timeObj.status = 'offline';
                } else if (timeObj.degradedTime > 0) {
                    timeObj.status = 'degraded';
                } else if (timeObj.upTime > 0) {
                    timeObj.status = 'online';
                }
            }
            timeBlock.push(Object.assign({}, timeObj));

            dayStart = dayStart.subtract(1, 'days');
        }

        return { timeBlock, uptimePercent: (totalUptime / totalTime) * 100 };
    }
}