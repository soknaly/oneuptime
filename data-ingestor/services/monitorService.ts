export default {
    updateCriterion: async function(
        _id: $TSFixMe,
        lastMatchedCriterion: $TSFixMe
    ) {
        try {
            await monitorCollection.updateOne(
                {
                    _id: ObjectId(_id),
                    $or: [{ deleted: false }, { deleted: { $exists: false } }],
                },
                { $set: { lastMatchedCriterion } }
            );
        } catch (error) {
            ErrorService.log('monitorService.updateCriterion', error);
            throw error;
        }
    },

    updateScanStatus: async function(monitorIds: $TSFixMe, status: $TSFixMe) {
        try {
            for (const id of monitorIds) {
                await monitorCollection.updateOne(
                    {
                        _id: ObjectId(id),
                        $or: [
                            { deleted: false },
                            { deleted: { $exists: false } },
                        ],
                    },
                    {
                        $set: { scanning: status },
                    }
                );
            }
        } catch (error) {
            ErrorService.log('monitorService.updateScanStatus', error);
            throw error;
        }
    },

    addProbeScanning: async function(monitorIds: $TSFixMe, probeId: $TSFixMe) {
        try {
            for (const id of monitorIds) {
                await monitorCollection.updateOne(
                    {
                        _id: ObjectId(id),
                        $or: [
                            { deleted: false },
                            { deleted: { $exists: false } },
                        ],
                    },
                    {
                        $push: { probeScanning: probeId },
                    }
                );
            }
        } catch (error) {
            ErrorService.log('monitorService.addProbeScanning', error);
            throw error;
        }
    },

    removeProbeScanning: async function(
        monitorIds: $TSFixMe,
        probeId: $TSFixMe
    ) {
        try {
            for (const id of monitorIds) {
                await monitorCollection.updateOne(
                    {
                        _id: ObjectId(id),
                        $or: [
                            { deleted: false },
                            { deleted: { $exists: false } },
                        ],
                    },
                    {
                        $pull: { probeScanning: probeId },
                    }
                );
            }
        } catch (error) {
            ErrorService.log('monitorService.removeProbeScanning', error);
            throw error;
        }
    },

    updateLighthouseScanStatus: async function(
        _id: $TSFixMe,
        lighthouseScanStatus: $TSFixMe,
        lighthouseScannedBy: $TSFixMe
    ) {
        try {
            const updateData = {};

            if (lighthouseScanStatus !== 'scanning') {
                updateData.lighthouseScannedAt = new Date(moment().format());

                updateData.lighthouseScannedBy = lighthouseScannedBy;
            } else {
                updateData.fetchLightHouse = null;
            }

            await monitorCollection.updateOne(
                {
                    _id: ObjectId(_id),
                    $or: [{ deleted: false }, { deleted: { $exists: false } }],
                },
                {
                    $set: {
                        lighthouseScanStatus,
                        ...updateData,
                    },
                }
            );
        } catch (error) {
            ErrorService.log(
                'monitorService.updateLighthouseScanStatus',
                error
            );
            throw error;
        }
    },

    updateScriptStatus: async function(
        _id: $TSFixMe,
        scriptRunStatus: $TSFixMe,
        scriptRunBy: $TSFixMe
    ) {
        try {
            await monitorCollection.updateOne(
                {
                    _id: ObjectId(_id),
                    $or: [{ deleted: false }, { deleted: { $exists: false } }],
                },
                {
                    $set: {
                        scriptRunStatus,
                        scriptRunBy,
                    },
                }
            );
        } catch (error) {
            ErrorService.log('monitorService.updateScriptStatus', error);
            throw error;
        }
    },

    async findOneBy({ query }: $TSFixMe) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted)
                query.$or = [
                    { deleted: false },
                    { deleted: { $exists: false } },
                ];

            const monitor = await monitorCollection.findOne(query);
            return monitor;
        } catch (error) {
            ErrorService.log('monitorService.findOneBy', error);
            throw error;
        }
    },

    async updateMonitorPingTime(id: $TSFixMe) {
        try {
            await monitorCollection.updateOne(
                {
                    _id: ObjectId(id),
                    $or: [{ deleted: false }, { deleted: { $exists: false } }],
                },
                { $set: { lastPingTime: new Date(moment().format()) } }
            );
            const monitor = await monitorCollection.findOne({
                _id: ObjectId(id),
                $or: [{ deleted: false }, { deleted: { $exists: false } }],
            });

            return monitor;
        } catch (error) {
            ErrorService.log('monitorService.updateMonitorPingTime', error);
            throw error;
        }
    },
};

import ErrorService from './errorService';
import moment from 'moment';

const monitorCollection = global.db.collection('monitors');
import { ObjectId } from 'mongodb';