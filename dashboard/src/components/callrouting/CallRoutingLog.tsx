import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { ListLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { getCallRoutingLogs } from '../../actions/callRouting';

import moment from 'moment';

const formatNumber = (phoneNumberString: $TSFixMe) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        const intlCode = match[1] ? '+1 ' : '';
        return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join(
            ''
        );
    }
    return phoneNumberString;
};
class CallRoutingLog extends Component {
    componentDidMount() {}

    prevClicked = (projectId: $TSFixMe, skip: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCallRoutingLogs' does not exist on ty... Remove this comment to see the full error message
        const { getCallRoutingLogs, limit } = this.props;
        getCallRoutingLogs(
            projectId,
            skip ? Number(skip) - limit : limit,
            limit
        );
    };

    nextClicked = (projectId: $TSFixMe, skip: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCallRoutingLogs' does not exist on ty... Remove this comment to see the full error message
        const { getCallRoutingLogs, limit } = this.props;
        getCallRoutingLogs(
            projectId,
            skip ? Number(skip) + limit : limit,
            limit
        );
    };

    render() {
        const {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'limit' does not exist on type 'Readonly<... Remove this comment to see the full error message
            limit,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'count' does not exist on type 'Readonly<... Remove this comment to see the full error message
            count,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'skip' does not exist on type 'Readonly<{... Remove this comment to see the full error message
            skip,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentProject' does not exist on type '... Remove this comment to see the full error message
            currentProject,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'logs' does not exist on type 'Readonly<{... Remove this comment to see the full error message
            logs,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
            error,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'requesting' does not exist on type 'Read... Remove this comment to see the full error message
            requesting,
        } = this.props;
        const footerBorderTopStyle = { margin: 0, padding: 0 };

        const canNext = count > Number(skip) + Number(limit) ? true : false;
        const canPrev = Number(skip) <= 0 ? false : true;

        return (
            <div className="bs-ContentSection Card-root Card-shadow--medium Margin-bottom--12">
                <div className="ContentHeader Box-root Box-background--white Box-divider--surface-bottom-1 Flex-flex Flex-direction--column Padding-horizontal--20 Padding-vertical--16">
                    <div className="Box-root Flex-flex Flex-direction--row Flex-justifyContent--spaceBetween">
                        <div className="ContentHeader-center Box-root Flex-flex Flex-direction--column Flex-justifyContent--center">
                            <span className="ContentHeader-title Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--28 Text-typeface--base Text-wrap--wrap">
                                <span>Call Routing Logs</span>
                            </span>
                            <span className="ContentHeader-description Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                <span>
                                    Here are the list of all logs created on
                                    routing calls.
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bs-ContentSection-content Box-root">
                    <div className="bs-ObjectList db-UserList">
                        <div
                            style={{
                                overflow: 'hidden',
                                overflowX: 'auto',
                            }}
                        >
                            <div
                                id="scheduledEventsList"
                                className="bs-ObjectList-rows"
                            >
                                <header className="bs-ObjectList-row bs-ObjectList-row--header">
                                    <div className="bs-ObjectList-cell">
                                        Called On
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Caller
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Forwarded To
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Status
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Created At
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Duration
                                    </div>
                                    <div className="bs-ObjectList-cell">
                                        Price
                                    </div>
                                </header>
                                {logs &&
                                    logs.length > 0 &&
                                    logs.map((log: $TSFixMe) => {
                                        let dialedLog = {};
                                        const dialed =
                                            log.dialTo && log.dialTo.length
                                                ? log.dialTo
                                                : [];
                                        const newDialed = dialed.filter(
                                            (d: $TSFixMe) => d.status &&
                                            d.status === 'completed'
                                        );
                                        if (newDialed && newDialed.length) {
                                            dialedLog = newDialed[0];
                                        } else if (
                                            dialed &&
                                            dialed.length < 2
                                        ) {
                                            dialedLog = dialed[0];
                                        }
                                        return (
                                            <div
                                                key={log._id}
                                                className="scheduled-event-list-item bs-ObjectList-row db-UserListRow db-UserListRow--withName"
                                                style={{
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                }}
                                                id={`logs_${log._id}`}
                                            >
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {formatNumber(
                                                            log.calledTo
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {formatNumber(
                                                            log.calledFrom
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {dialedLog &&
                                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userId' does not exist on type '{}'.
                                                        dialedLog.userId &&
                                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userId' does not exist on type '{}'.
                                                        dialedLog.userId.length
                                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'userId' does not exist on type '{}'.
                                                            ? dialedLog.userId
                                                            : dialedLog &&
                                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'scheduleId' does not exist on type '{}'.
                                                              dialedLog.scheduleId &&
                                                              dialedLog
                                                                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'scheduleId' does not exist on type '{}'.
                                                                  .scheduleId
                                                                  .length
                                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'scheduleId' does not exist on type '{}'.
                                                            ? dialedLog.scheduleId
                                                            : dialedLog &&
                                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'phoneNumber' does not exist on type '{}'... Remove this comment to see the full error message
                                                              dialedLog.phoneNumber &&
                                                              dialedLog
                                                                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'phoneNumber' does not exist on type '{}'... Remove this comment to see the full error message
                                                                  .phoneNumber
                                                                  .length
                                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'phoneNumber' does not exist on type '{}'... Remove this comment to see the full error message
                                                            ? dialedLog.phoneNumber
                                                            : 'unknown user'}
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {dialedLog &&
                                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{}'.
                                                        dialedLog.status
                                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{}'.
                                                            ? dialedLog.status
                                                            : 'unknown status'}
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {moment(
                                                            log.createdAt
                                                        ).format(
                                                            'MMMM Do YYYY, h:mm:ss a'
                                                        )}{' '}
                                                        (
                                                        {moment(
                                                            log.createdAt
                                                        ).fromNow()}
                                                        )
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {log.duration || ''} sec
                                                    </div>
                                                </div>
                                                <div className="bs-ObjectList-cell bs-u-v-middle">
                                                    <div className="bs-ObjectList-cell-row">
                                                        {log.price}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                <ShouldRender
                                    if={
                                        !(
                                            (!logs || logs.length === 0) &&
                                            !requesting &&
                                            !error
                                        )
                                    }
                                >
                                    <div style={footerBorderTopStyle}></div>
                                </ShouldRender>
                            </div>
                        </div>
                        <ShouldRender if={requesting}>
                            <ListLoader />
                        </ShouldRender>
                        <ShouldRender
                            if={
                                (!logs || logs.length === 0) &&
                                !requesting &&
                                !error
                            }
                        >
                            <div
                                className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--center"
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                    padding: '20px 10px 0',
                                }}
                                id="noCustomFields"
                            >
                                <span>
                                    {(!logs || logs.length === 0) &&
                                    !requesting &&
                                    !error
                                        ? 'You have no call routing logs at this time'
                                        : null}
                                </span>
                            </div>
                        </ShouldRender>
                        <div
                            className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween"
                            style={{ backgroundColor: 'white' }}
                        >
                            <div className="Box-root Flex-flex Flex-alignItems--center Padding-all--20">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                    <span>
                                        <span
                                            id="customFieldCount"
                                            className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap"
                                        >
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'count' does not exist on type 'Readonly<... Remove this comment to see the full error message
                                            {this.props.count
                                                // @ts-expect-error ts-migrate(2339) FIXME: Property 'count' does not exist on type 'Readonly<... Remove this comment to see the full error message
                                                ? this.props.count +
                                                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'count' does not exist on type 'Readonly<... Remove this comment to see the full error message
                                                  (this.props.count > 1
                                                      ? '  Logs'
                                                      : ' Log')
                                                : '0 Log'}
                                        </span>
                                    </span>
                                </span>
                            </div>
                            <div className="Box-root Padding-horizontal--20 Padding-vertical--16">
                                <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                    <div className="Box-root Margin-right--8">
                                        <button
                                            id="btnPrevCustomFields"
                                            onClick={() =>
                                                this.prevClicked(
                                                    currentProject._id,
                                                    skip
                                                )
                                            }
                                            className={
                                                'Button bs-ButtonLegacy' +
                                                (canPrev ? '' : 'Is--disabled')
                                            }
                                            disabled={!canPrev}
                                            data-db-analytics-name="list_view.pagination.previous"
                                            type="button"
                                        >
                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                    <span>Previous</span>
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="Box-root">
                                        <button
                                            id="btnNextCustomFields"
                                            onClick={() =>
                                                this.nextClicked(
                                                    currentProject._id,
                                                    skip
                                                )
                                            }
                                            className={
                                                'Button bs-ButtonLegacy' +
                                                (canNext ? '' : 'Is--disabled')
                                            }
                                            disabled={!canNext}
                                            data-db-analytics-name="list_view.pagination.next"
                                            type="button"
                                        >
                                            <div className="Button-fill bs-ButtonLegacy-fill Box-root Box-background--white Flex-inlineFlex Flex-alignItems--center Flex-direction--row Padding-horizontal--8 Padding-vertical--4">
                                                <span className="Button-label Text-color--default Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--noWrap">
                                                    <span>Next</span>
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
CallRoutingLog.displayName = 'CallRoutingLog';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CallRoutingLog.propTypes = {
    count: PropTypes.number,
    currentProject: PropTypes.object,
    error: PropTypes.string,
    getCallRoutingLogs: PropTypes.func,
    limit: PropTypes.number,
    logs: PropTypes.shape({
        length: PropTypes.number,
        map: PropTypes.func,
    }),
    requesting: PropTypes.bool,
    skip: PropTypes.number,
};

const mapDispatchToProps = (dispatch: $TSFixMe) => bindActionCreators({ getCallRoutingLogs }, dispatch);

const mapStateToProps = (state: $TSFixMe) => {
    return {
        currentProject: state.project.currentProject,
        logs: state.callRouting.callRoutingLogs.logs,
        requesting: state.callRouting.callRoutingLogs.requesting,
        error: state.callRouting.callRoutingLogs.error,
        count: state.callRouting.callRoutingLogs.count,
        limit: state.callRouting.callRoutingLogs.limit,
        skip: state.callRouting.callRoutingLogs.skip,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(CallRoutingLog));