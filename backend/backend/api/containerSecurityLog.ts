import express from 'express';
const getUser = require('../middlewares/user').getUser;

import { isAuthorized } from '../middlewares/authorization';
import {
    sendErrorResponse,
    sendItemResponse,
} from 'common-server/utils/response';

import ContainerSecurityLogService from '../services/containerSecurityLogService';

const router = express.Router();

//Route: GET
//Description: get a particular container security log
//Params: req.params -> {projectId, componentId, containerSecurityId}
//returns: response -> {sendItemResponse, sendErrorResponse}
router.get(
    '/:projectId/:componentId/container/logs/:containerSecurityId',
    getUser,
    isAuthorized,
    async (req: Request, res: Response) => {
        try {
            const { containerSecurityId, componentId } = req.params;

            const selectContainerLog =
                'securityId componentId data deleted deleteAt';

            const populateContainerLog = [
                { path: 'securityId', select: 'name slug' },
                { path: 'componentId', select: 'name slug' },
            ];
            const securityLog = await ContainerSecurityLogService.findOneBy({
                query: { securityId: containerSecurityId, componentId },
                select: selectContainerLog,
                populate: populateContainerLog,
            });
            return sendItemResponse(req, res, securityLog);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: GET
//Description: get a particular container security log by slug
//Params: req.params -> {projectId, componentId, containerSecuritySlug}
//returns: response -> {sendItemResponse, sendErrorResponse}
router.get(
    '/:projectId/:componentId/containerSecuritySlug/logs/:containerSecuritySlug',
    getUser,
    isAuthorized,
    async (req: Request, res: Response) => {
        try {
            const { containerSecuritySlug, componentId } = req.params;

            const selectContainerLog =
                'securityId componentId data deleted deleteAt';

            const populateContainerLog = [
                { path: 'securityId', select: 'name slug' },
                { path: 'componentId', select: 'name slug' },
            ];
            const securityLog = await ContainerSecurityLogService.findOneBy({
                query: { slug: containerSecuritySlug, componentId },
                select: selectContainerLog,
                populate: populateContainerLog,
            });
            return sendItemResponse(req, res, securityLog);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

//Route: GET
//Description: get container security logs in a component
//Params: req.params -> {projectId, componentId}
//returns: response -> {sendItemResponse, sendErrorResponse}
router.get(
    '/:projectId/:componentId/container/logs',
    getUser,
    isAuthorized,
    async (req: Request, res: Response) => {
        try {
            const { componentId } = req.params;
            const selectContainerLog =
                'securityId componentId data deleted deleteAt';

            const populateContainerLog = [
                { path: 'securityId', select: 'name slug' },
                { path: 'componentId', select: 'name slug' },
            ];
            const securityLogs = await ContainerSecurityLogService.findBy({
                componentId,
                select: selectContainerLog,
                populate: populateContainerLog,
            });
            return sendItemResponse(req, res, securityLogs);
        } catch (error) {
            return sendErrorResponse(req, res, error);
        }
    }
);

export default router;