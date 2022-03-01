import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
    constructor(props: $TSFixMe) {
        super(props);
        this.state = { error: null, hasError: false };
    }

    static getDerivedStateFromError(error: $TSFixMe) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    render() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'hasError' does not exist on type 'Readon... Remove this comment to see the full error message
        if (this.state.hasError || this.state.error) {
            return (
                <div
                    id="app-loading"
                    style={{
                        position: 'fixed',
                        top: '0',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        backgroundColor: '#fdfdfd',
                        zIndex: '999',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        An unexpected error has occured. Please reload the page
                        to continue
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
ErrorBoundary.displayName = 'ErrorBoundary';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ErrorBoundary.propTypes = {
    children: PropTypes.any,
};

export default ErrorBoundary;