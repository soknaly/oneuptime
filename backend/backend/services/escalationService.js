var EscalationModel = require('../models/escalation');
var ErrorService = require('./errorService');
const moment = require('moment');
const DateTime = require('../utils/DateTime');

module.exports = {

    findBy: async function ({query, limit, skip, sort}) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 10;

            if (typeof (skip) === 'string') skip = parseInt(skip);

            if (typeof (limit) === 'string') limit = parseInt(limit);

            if (!query) query = {};

            if (!query.deleted) query.deleted = false;
            var escalations = await EscalationModel.find(query)
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .populate('projectId', 'name')
                .populate('scheduleId', 'name');
            return escalations;
        } catch (error) {
            ErrorService.log('escalationService.findBy', error);
            throw error;
        }
    },

    findOneBy: async function (query) {

        try {

            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            var escalation = await EscalationModel.findOne(query)
                .populate('projectId', 'name')
                .populate('scheduleId', 'name')
                .lean();

            const { activeTeam, nextActiveTeam } = computeActiveTeams(escalation);
            escalation.activeTeam = activeTeam;
            escalation.nextActiveTeam = nextActiveTeam;

            return escalation;
        } catch (error) {
            ErrorService.log('escalationService.findOneBy', error);
            throw error;
        }

    },

    create: async function (data) {
        try {

            let escalationModel = new EscalationModel({
                call: data.call,
                email: data.email,
                sms: data.sms,
                callReminders: data.callReminders,
                smsReminders: data.smsReminders,
                emailReminders: data.emailReminders,
                rotateBy: data.rotateBy,
                rotationInterval: data.rotationInterval,
                firstRotationOn: data.firstRotationOn,
                rotationTimezone: data.rotationTimezone,
                projectId: data.projectId,
                scheduleId: data.scheduleId,
                createdById: data.createdById,
                teams: data.teams,
            });

            var escalation = await escalationModel.save();
            return escalation;
        } catch (error) {
            ErrorService.log('escalationService.create', error);
            throw error;
        }
    },

    countBy: async function (query) {

        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            var count = await EscalationModel.count(query);
            return count;
        } catch (error) {
            ErrorService.log('escalationService.countBy', error);
            throw error;
        }
    },

    deleteBy: async function (query, userId) {
        try {
            var escalation = await EscalationModel.findOneAndUpdate(query, {
                $set: {
                    deleted: true,
                    deletedById: userId,
                    deletedAt: Date.now()
                }
            }, {
                new: true
            });
            return escalation;
        } catch (error) {
            ErrorService.log('escalationService.deleteBy', error);
            throw error;
        }
    },

    updateOneBy: async function (query, data) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            var escalation = await EscalationModel.findOneAndUpdate(query, {
                $set: data
            }, {
                new: true
            });
        } catch (error) {
            ErrorService.log('escalationService.updateOneBy', error);
            throw error;
        }
        return escalation;
    },

    updateBy: async function (query, data) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            var updatedData = await EscalationModel.updateMany(query, {
                $set: data
            });
            updatedData = await this.findBy(query);
            return updatedData;
        } catch (error) {
            ErrorService.log('escalationService.updateMany', error);
            throw error;
        }
    },

    removeEscalationMember: async function (projectId, memberId) {
        try {
            var _this = this;
            var escalations = await _this.findBy({qeury:{ projectId }});

            if (escalations && escalations.length > 0) {
                await Promise.all(escalations.map(async (escalation) => {
                    var teams = escalation.teams.map((team)=>{
                        var teamMembers = team.teamMembers; 
                        teamMembers = teamMembers.filter((member)=>{
                            return member.userId !== memberId;
                        });

                        team.teamMembers = teamMembers;

                        return team;
                    });
                    await _this.updateOneBy({ _id: escalation._id }, { teams: teams });
                }));
            }
        } catch (error) {
            ErrorService.log('escalationService.removeEscalationMember', error);
            throw error;
        }
    },

    hardDeleteBy: async function (query) {
        try {
            await EscalationModel.deleteMany(query);
            return 'Escalation(s) removed successfully';
        } catch (error) {
            ErrorService.log('escalationService.hardDeleteBy', error);
            throw error;
        }
    },

    restoreBy: async function (query) {
        const _this = this;
        query.deleted = true;
        let escalation = await _this.findBy({query});
        if (escalation && escalation.length > 1) {
            const escalations = await Promise.all(escalation.map(async (escalation) => {
                const escalationId = escalation._id;
                escalation = await _this.updateOneBy({ _id: escalationId, deleted: true }, {
                    deleted: false,
                    deletedAt: null,
                    deleteBy: null
                });
                return escalation;
            }));
            return escalations;
        } else {
            escalation = escalation[0];
            if (escalation) {
                const escalationId = escalation._id;
                escalation = await _this.updateOneBy({ _id: escalationId, deleted: true }, {
                    deleted: false,
                    deletedAt: null,
                    deleteBy: null
                });
            }
            return escalation;
        }
    }
};


function computeActiveTeamIndex(numberOfTeams, intervalDifference, rotationInterval) {
    var difference = Math.floor(intervalDifference / rotationInterval);
    return difference % numberOfTeams;
}

function computeActiveTeams(escalation) {

    let {
        teams, rotationInterval, rotateBy,
        firstRotationOn, createdAt, rotationTimezone
    } = escalation;

    const currentDate = new Date();



    if (rotateBy && rotateBy != '') {

        var intervalDifference = 0;

        //convert rotation switch time to timezone. 
        firstRotationOn = DateTime.changeDateTimezone(firstRotationOn, rotationTimezone);

        if (rotateBy === 'months') {
            intervalDifference = DateTime.getDifferenceInMonths(firstRotationOn, currentDate);
        }

        if (rotateBy === 'weeks') {
            intervalDifference = DateTime.getDifferenceInWeeks(firstRotationOn, currentDate);
        }

        if (rotateBy === 'days') {
            intervalDifference = DateTime.getDifferenceInDays(firstRotationOn, currentDate);
        }

        const activeTeamIndex = computeActiveTeamIndex(teams.length, intervalDifference, rotationInterval);
        let activeTeamRotationStartTime = null;

        //if the first rotation hasn't kicked in yet. 
        if (DateTime.lessThan(currentDate, firstRotationOn)) {
            activeTeamRotationStartTime = createdAt;
        } else {
            activeTeamRotationStartTime = moment(firstRotationOn).add(intervalDifference, rotateBy);
        }

        let activeTeamRotationEndTime = moment(activeTeamRotationStartTime).add(rotationInterval, rotateBy);

        const activeTeam = {
            _id: teams[activeTeamIndex]._id,
            teamMembers: teams[activeTeamIndex].teamMembers,
            rotationStartTime: activeTeamRotationStartTime,
            rotationEndTime: activeTeamRotationEndTime
        };


        let nextActiveTeamIndex = activeTeamIndex + 1;

        if (!teams[nextActiveTeamIndex]) {
            nextActiveTeamIndex = 0;
        }

        const nextActiveTeamRotationStartTime = activeTeamRotationEndTime;
        const nextActiveTeamRotationEndTime = moment(nextActiveTeamRotationStartTime).add(rotationInterval, rotateBy);
        const nextActiveTeam = {
            _id: teams[nextActiveTeamIndex]._id,
            teamMembers: teams[nextActiveTeamIndex].teamMembers,
            rotationStartTime: nextActiveTeamRotationStartTime,
            rotationEndTime: nextActiveTeamRotationEndTime,
        };

        return { activeTeam, nextActiveTeam };
    } else {
        return {
            activeTeam: {
                _id: teams[0]._id,
                teamMembers: teams[0].teamMembers,
                rotationStartTime: null,
                rotationEndTime: null
            },
            nextActiveTeam: null
        };
    }
}

module.exports.computeActiveTeams = computeActiveTeams;

