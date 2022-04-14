import BackendAPI from 'CommonUI/src/utils/api/backend';
import { Dispatch } from 'redux';
import * as types from '../constants/statusPageCategory';
import ErrorPayload from 'CommonUI/src/payload-types/error';
// create status page category
export const createStatusPageCategoryRequest: Function = (): void => ({
    type: types.CREATE_STATUS_PAGE_CATEGORY_REQUEST,
});

export const createStatusPageCategorySuccess: Function = (
    payload: $TSFixMe
): void => ({
    type: types.CREATE_STATUS_PAGE_CATEGORY_SUCCESS,
    payload,
});

export const createStatusPageCategoryFailure: Function = (
    error: ErrorPayload
): void => ({
    type: types.CREATE_STATUS_PAGE_CATEGORY_FAILURE,
    payload: error,
});

export const createStatusPageCategory: $TSFixMe =
    ({ projectId, statusPageId, statusPageCategoryName }: $TSFixMe) =>
    (dispatch: Dispatch) => {
        const promise: $TSFixMe = BackendAPI.post(
            `statusPageCategory/${projectId}/${statusPageId}`,
            {
                statusPageCategoryName,
            }
        );
        dispatch(createStatusPageCategoryRequest());

        promise.then(
            (response): void => {
                dispatch(createStatusPageCategorySuccess(response.data));
            },
            (error): void => {
                dispatch(createStatusPageCategoryFailure(error));
            }
        );
        return promise;
    };

// update status page category
export const updateStatusPageCategoryRequest: Function = (): void => ({
    type: types.UPDATE_STATUS_PAGE_CATEGORY_REQUEST,
});

export const updateStatusPageCategorySuccess: Function = (
    payload: $TSFixMe
): void => ({
    type: types.UPDATE_STATUS_PAGE_CATEGORY_SUCCESS,
    payload,
});

export const updateStatusPageCategoryFailure: Function = (
    error: ErrorPayload
): void => ({
    type: types.UPDATE_STATUS_PAGE_CATEGORY_FAILURE,
    payload: error,
});

export const updateStatusPageCategory: $TSFixMe =
    ({ projectId, statusPageCategoryId, statusPageCategoryName }: $TSFixMe) =>
    (dispatch: Dispatch) => {
        const promise: $TSFixMe = BackendAPI.put(
            `statusPageCategory/${projectId}/${statusPageCategoryId}`,
            {
                statusPageCategoryName,
            }
        );
        dispatch(updateStatusPageCategoryRequest());

        promise.then(
            (response): void => {
                dispatch(updateStatusPageCategorySuccess(response.data));
            },
            (error): void => {
                dispatch(updateStatusPageCategoryFailure(error));
            }
        );
        return promise;
    };

// fetch status page categories
export const fetchStatusPageCategoriesRequest: Function = (): void => ({
    type: types.FETCH_STATUS_PAGE_CATEGORIES_REQUEST,
});

export const fetchStatusPageCategoriesSuccess: Function = (
    payload: $TSFixMe
): void => ({
    type: types.FETCH_STATUS_PAGE_CATEGORIES_SUCCESS,
    payload,
});

export const fetchStatusPageCategoriesFailure: Function = (
    error: ErrorPayload
): void => ({
    type: types.FETCH_STATUS_PAGE_CATEGORIES_FAILURE,
    payload: error,
});

export const fetchStatusPageCategories: $TSFixMe =
    ({ projectId, statusPageId, skip, limit }: $TSFixMe) =>
    (dispatch: Dispatch) => {
        if (!skip) {
            skip = 0;
        }
        if (!limit) {
            limit = 0;
        }
        const promise: $TSFixMe = BackendAPI.get(
            `statusPageCategory/${projectId}/${statusPageId}?skip=${skip}&limit=${limit}`
        );
        dispatch(fetchStatusPageCategoriesRequest());

        promise.then(
            (response): void => {
                dispatch(fetchStatusPageCategoriesSuccess(response.data));
            },
            (error): void => {
                dispatch(fetchStatusPageCategoriesFailure(error));
            }
        );
        return promise;
    };

// fetch  status page categories
export const fetchAllStatusPageCategoriesRequest: Function = (): void => ({
    type: types.FETCH_ALL_STATUS_PAGE_CATEGORIES_REQUEST,
});

export const fetchAllStatusPageCategoriesSuccess: Function = (
    payload: $TSFixMe
): void => ({
    type: types.FETCH_ALL_STATUS_PAGE_CATEGORIES_SUCCESS,
    payload,
});

export const fetchAllStatusPageCategoriesFailure: Function = (
    error: ErrorPayload
): void => ({
    type: types.FETCH_ALL_STATUS_PAGE_CATEGORIES_FAILURE,
    payload: error,
});

export const fetchAllStatusPageCategories: $TSFixMe =
    ({ projectId, statusPageId, skip, limit }: $TSFixMe) =>
    (dispatch: Dispatch) => {
        if (!skip) {
            skip = 0;
        }
        if (!limit) {
            limit = 0;
        }
        const promise: $TSFixMe = BackendAPI.get(
            `statusPageCategory/${projectId}/${statusPageId}?skip=${skip}&limit=${limit}`
        );
        dispatch(fetchAllStatusPageCategoriesRequest());

        promise.then(
            (response): void => {
                dispatch(fetchAllStatusPageCategoriesSuccess(response.data));
            },
            (error): void => {
                dispatch(fetchAllStatusPageCategoriesFailure(error));
            }
        );
        return promise;
    };

// delete status page category
export const deleteStatusPageCategoryRequest: Function = (): void => ({
    type: types.DELETE_STATUS_PAGE_CATEGORY_REQUEST,
});

export const deleteStatusPageCategorySuccess: Function = (
    payload: $TSFixMe
): void => ({
    type: types.DELETE_STATUS_PAGE_CATEGORY_SUCCESS,
    payload,
});

export const deleteStatusPageCategoryFailure: Function = (
    error: ErrorPayload
): void => ({
    type: types.DELETE_STATUS_PAGE_CATEGORY_FAILURE,
    payload: error,
});

export const deleteStatusPageCategory: $TSFixMe =
    ({ projectId, statusPageCategoryId }: $TSFixMe) =>
    (dispatch: Dispatch) => {
        const promise: $TSFixMe =
            delete `statusPageCategory/${projectId}/${statusPageCategoryId}`;
        dispatch(updateStatusPageCategoryRequest());

        promise.then(
            (response): void => {
                dispatch(updateStatusPageCategorySuccess(response.data));
            },
            (error): void => {
                dispatch(updateStatusPageCategoryFailure(error));
            }
        );
        return promise;
    };