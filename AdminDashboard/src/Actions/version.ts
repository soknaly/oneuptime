import BackendAPI from 'CommonUI/src/utils/api/backend';
import HelmAPI from 'CommonUI/src/utils/api/helm';
import APiDocsAPI from 'CommonUI/src/utils/api/ApiDocs';
import DashboardAPI from 'CommonUI/src/utils/api/dashboard';

import * as types from '../constants/version';
import { Dispatch } from 'redux';
import Route from 'Common/Types/api/route';

export const getVersionRequest = (promise: $TSFixMe) => {
    return {
        type: types.GET_VERSION_REQUEST,
        payload: promise,
    };
};

export const getVersionError = (error: $TSFixMe) => {
    return {
        type: types.GET_VERSION_FAILED,
        payload: error,
    };
};

export const getVersionSuccess = (versions: $TSFixMe) => {
    return {
        type: types.GET_VERSION_SUCCESS,
        payload: versions,
    };
};

export const resetGetVersion = () => {
    return {
        type: types.GET_VERSION_RESET,
    };
};

export const getVersion = () => {
    return function (dispatch: Dispatch) {
        let promise = null;
        let backendPromise = null;
        let helmChartPromise = null;
        let docsPromise = null;
        let dashboardPromise = null;

        backendPromise = BackendAPI.get(new Route('/version'));
        helmChartPromise = HelmAPI.get(new Route('/version'));
        docsPromise = APiDocsAPI.get(new Route('/version'));
        dashboardPromise = DashboardAPI.get(new Route('/version'));

        promise = Promise.all([
            backendPromise,
            helmChartPromise,
            docsPromise,
            dashboardPromise,
        ]);

        dispatch(getVersionRequest(promise));

        promise.then(
            function (versions) {
                let versionsObject = {};
                versions.forEach(version => {
                    versionsObject = { ...versionsObject, ...version.data };
                });

                dispatch(getVersionSuccess(versionsObject));
            },
            function (error) {
                dispatch(getVersionError(error));
            }
        );

        return promise;
    };
};
