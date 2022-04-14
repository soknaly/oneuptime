import moment from 'moment';
import { ObjectId } from 'mongodb';
import Database from 'CommonServer/utils/database';
const probeCollection: $TSFixMe = Database.getDatabase().collection('probes');
import { v1 as uuidv1 } from 'uuid';
import { post } from '../Utils/api';
import { realtimeUrl } from '../Config';
const realtimeBaseUrl: string = `${realtimeUrl}/realtime`;

export default {
    create: async function (data): void {
        let probeKey;
        if (data.probeKey) {
            probeKey = data.probeKey;
        } else {
            probeKey = uuidv1();
        }
        const storedProbe: $TSFixMe = await this.findOneBy({
            probeName: data.probeName,
        });
        if (storedProbe && storedProbe.probeName) {
            const error: $TSFixMe = new Error('Probe name already exists.');

            error.code = 400;

            throw error;
        } else {
            const probe: $TSFixMe = {};

            probe.probeKey = probeKey;

            probe.probeName = data.probeName;

            probe.version = data.probeVersion;

            const now: $TSFixMe = new Date(moment().format());

            probe.createdAt = now;

            probe.lastAlive = now;

            probe.deleted = false;

            const result: $TSFixMe = await probeCollection.insertOne(probe);
            const savedProbe: $TSFixMe = await this.findOneBy({
                _id: ObjectId(result.insertedId),
            });
            return savedProbe;
        }
    },

    findOneBy: async function (query): void {
        if (!query) {
            query = {};
        }

        if (!query.deleted) {
            query.$or = [{ deleted: false }, { deleted: { $exists: false } }];
        }

        const probe: $TSFixMe = await probeCollection.findOne(query);
        return probe;
    },

    updateOneBy: async function (query, data): void {
        if (!query) {
            query = {};
        }

        if (!query.deleted) {
            query.$or = [{ deleted: false }, { deleted: { $exists: false } }];
        }

        await probeCollection.updateOne(query, { $set: data });
        const probe: $TSFixMe = await this.findOneBy(query);
        return probe;
    },

    updateProbeStatus: async function (probeId): void {
        const now: $TSFixMe = new Date(moment().format());
        await probeCollection.updateOne(
            {
                _id: ObjectId(probeId),
                $or: [{ deleted: false }, { deleted: { $exists: false } }],
            },
            { $set: { lastAlive: now } }
        );
        const probe: $TSFixMe = await this.findOneBy({
            _id: ObjectId(probeId),
        });

        // realtime update for probe
        post(`${realtimeBaseUrl}/update-probe`, { data: probe }, true);
        return probe;
    },
};