import { createStore, applyMiddleware, compose } from 'redux';
import history from 'common-ui/src/utils/history';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';

import queryString from 'query-string';

import rootReducer from './reducers';

// A nice helper to tell us if we're on the server
export const isApiServer = !(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);

export const removeQuery = (removeField: string) => {
    const location = Object.assign({}, history.location);
    const query = queryString.parse(location.search);
    if (query[removeField]) delete query[removeField];

    // remove "token" field - keeping this to prevent regression
    if (query['token']) delete query['token'];

    location.search = queryString.stringify(query);
    history.push(location);
};

const initialState = {};
const enhancers = [];
const logger = createLogger();
const middleware = [thunk, routerMiddleware(history)];

if (process.env['NODE_ENV'] === 'development') {
    let devToolsExtension;
    if (!isApiServer) {
        devToolsExtension = window.devToolsExtension;
    }
    middleware.push(logger);

    if (typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension());
    }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

const store = createStore(rootReducer, initialState, composedEnhancers);

export type RootState = ReturnType<typeof store.getState>;

export default store;