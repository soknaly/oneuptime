import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'redu... Remove this comment to see the full error message
import { Field } from 'redux-form';
import ShouldRender from '../basic/ShouldRender';
import TeamMemberSelector from '../basic/TeamMemberSelector';
import TimeSelector from '../basic/TimeSelector';
import Tooltip from '../basic/Tooltip';
import PricingPlan from '../basic/PricingPlan';
import moment from 'moment-timezone';
import { RenderSelect } from '../basic/RenderSelect';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'redu... Remove this comment to see the full error message
import { change } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'redu... Remove this comment to see the full error message
import { formValueSelector } from 'redux-form';

let RenderMember = ({
    memberValue,
    inputarray,
    subProjectId,
    policyIndex,
    teamIndex,
    nameIndex,
    fields,
    change,
    form,
    projectGroups,
    formValues
}: $TSFixMe) => {
    const [timeVisible, setTimeVisible] = useState(false);
    const [forcedTimeHide, forceTimeHide] = useState(false);
    const [type, setType] = useState({});

    const manageVisibility = (timeVisible: $TSFixMe, memberHasCallTimes: $TSFixMe) => {
        setTimeVisible(timeVisible);
        if (memberHasCallTimes && !timeVisible) {
            forceTimeHide(true);
        }

        if (memberHasCallTimes && timeVisible) {
            forceTimeHide(false);
        }
    };
    const updateTypeOnMount = () => {
        setType({
            ...type,
            [teamIndex.toString() + nameIndex.toString()]: form[policyIndex]
                .teams[teamIndex].teamMembers[nameIndex].groupId
                ? 'group'
                : 'team',
        });
    };

    useEffect(updateTypeOnMount, [inputarray, form]);

    const memberHasCallTimes = !!(memberValue.startTime && memberValue.endTime);
    const showTimes = memberHasCallTimes ? !forcedTimeHide : timeVisible;

    const getCurrentTimezone = () => {
        const tz = moment.tz.guess();
        const result = `${tz} GMT${moment()
            .tz(tz)
            .format('Z')}`;
        return result;
    };

    const handleSwitch = (val: $TSFixMe) => {
        setType({ [teamIndex.toString() + nameIndex.toString()]: val });
        if (val === 'team') {
            change('OnCallAlertBox', `${inputarray}.groupId`, '');
        }
        if (val === 'group') {
            change('OnCallAlertBox', `${inputarray}.userId`, '');
        }
    };
    const renderKey =
        'team-group' + teamIndex.toString() + nameIndex.toString();

    const renderType =
        formValues[renderKey] ||
        (form[policyIndex].teams[teamIndex].teamMembers[nameIndex].groupId
            ? 'group'
            : 'team');
    return (
        <li key={nameIndex}>
            <ShouldRender if={projectGroups && projectGroups.count > 0}>
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label">
                        Select Team Member or Groups
                    </label>
                    <div className="bs-Fieldset-fields">
                        <span>
                            <Field
                                id={`${inputarray}.${
                                    type[
                                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'any[]' cannot be used as an index type.
                                        [
                                            teamIndex.toString() +
                                                nameIndex.toString(),
                                        ]
                                    ] === 'group'
                                        ? 'groupId'
                                        : 'userId'
                                }`}
                                className="db-select-nw"
                                type="text"
                                name={
                                    'team-group' +
                                    teamIndex.toString() +
                                    nameIndex.toString()
                                }
                                component={RenderSelect}
                                placeholder={
                                    type[
                                        // @ts-expect-error ts-migrate(2538) FIXME: Type 'any[]' cannot be used as an index type.
                                        [
                                            teamIndex.toString() +
                                                nameIndex.toString(),
                                        ]
                                    ] === 'group'
                                        ? 'Groups'
                                        : 'Team members'
                                }
                                options={[
                                    { label: 'Team members', value: 'team' },
                                    { label: 'Groups', value: 'group' },
                                ]}
                                onChange={(event: $TSFixMe, newValue: $TSFixMe) => {
                                    handleSwitch(newValue);
                                }}
                                subProjectId={subProjectId}
                                policyIndex={policyIndex}
                                teamIndex={teamIndex}
                            />
                        </span>
                    </div>
                </div>
            </ShouldRender>
            <div className="bs-Fieldset-row">
                <label className="bs-Fieldset-label">
                    {renderType === 'group' ? 'Group' : 'Team Member'}
                </label>
                <div className="bs-Fieldset-fields">
                    <span className="flex">
                        <Field
                            id={`${inputarray}.userId`}
                            className="db-BusinessSettings-input TextInput bs-TextInput"
                            type="text"
                            name={`${inputarray}.${
                                renderType === 'group' ? 'groupId' : 'userId'
                            }`}
                            component={TeamMemberSelector}
                            placeholder="Nawaz"
                            subProjectId={subProjectId}
                            policyIndex={policyIndex}
                            teamIndex={teamIndex}
                            renderType={renderType}
                        />
                        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; title: string; }' is no... Remove this comment to see the full error message
                        <Tooltip title="Call Reminders">
                            <div>
                                <p> Team member who will be on-call duty. </p>
                            </div>
                        </Tooltip>
                    </span>
                </div>
            </div>

            {!showTimes && (
                <>
                    <div className="bs-Fieldset-row">
                        <label className="bs-Fieldset-label"></label>
                        <div className="bs-Fieldset-fields">
                            <button
                                className="button-as-anchor"
                                onClick={() =>
                                    manageVisibility(true, memberHasCallTimes)
                                }
                                id="addOnCallDutyTimes"
                            >
                                // @ts-expect-error ts-migrate(2747) FIXME: 'PricingPlan' components don't accept text as chil... Remove this comment to see the full error message
                                <PricingPlan plan="Growth" hideChildren={false}>
                                    Advanced: Add on-call duty times
                                </PricingPlan>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showTimes && (
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label">
                        On-Call Start Time
                    </label>
                    <div className="bs-Fieldset-fields">
                        <span className="flex">
                            <Field
                                className="db-BusinessSettings-input TextInput bs-TextInput"
                                type="text"
                                name={`${inputarray}.startTime`}
                                component={TimeSelector}
                                placeholder="10pm"
                                style={{ width: '250px' }}
                            />
                            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; title: string; }' is no... Remove this comment to see the full error message
                            <Tooltip title="Start Time">
                                <div>
                                    <p>
                                        {' '}
                                        Here&#39;s an example, <br />
                                        <br />
                                        You add two team members to your on-call
                                        team - one of them is in US and the
                                        other is in India. <br />
                                        <br />
                                        You can set US team member to be on call
                                        from 9:00 AM EST to 9:00 PM EST and
                                        India team member to be on call from
                                        9:00 PM EST to 9:00 AM EST. <br />
                                        <br />
                                        This helps you distribute on-call duty
                                        based on geographical locations of team
                                        members. <br />
                                        <br />
                                        On-Call start time is start of the
                                        on-call duty time.{' '}
                                    </p>
                                </div>
                            </Tooltip>
                        </span>
                        <label className="bs-oncall-label">
                            {getCurrentTimezone()}
                        </label>
                    </div>
                </div>
            )}

            {showTimes && (
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label">
                        On-Call End Time
                    </label>
                    <div className="bs-Fieldset-fields">
                        <span className="flex">
                            <Field
                                className="db-BusinessSettings-input TextInput bs-TextInput"
                                type="text"
                                name={`${inputarray}.endTime`}
                                component={TimeSelector}
                                placeholder="11pm"
                                style={{ width: '250px' }}
                            />
                            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; title: string; }' is no... Remove this comment to see the full error message
                            <Tooltip title="End Time">
                                <div>
                                    <p>
                                        {' '}
                                        Here&#39;s an example, <br />
                                        <br />
                                        You add two team members to your on-call
                                        team - one of them is in US and the
                                        other is in India. <br />
                                        <br />
                                        You can set US team member to be on call
                                        from 9:00 AM EST to 9:00 PM EST and
                                        India team member to be on call from
                                        9:00 PM EST to 9:00 AM EST. <br />
                                        <br /> This helps you distribute on-call
                                        duty based on geographical locations of
                                        team members. <br />
                                        <br />
                                        On-Call end time is end of the on-call
                                        duty time.{' '}
                                    </p>
                                </div>
                            </Tooltip>
                        </span>
                        <label className="bs-oncall-label">
                            {getCurrentTimezone()}
                        </label>
                    </div>
                </div>
            )}

            {showTimes && (
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label"></label>
                    <div className="bs-Fieldset-fields">
                        <button
                            className="button-as-anchor"
                            onClick={() => {
                                memberValue.startTime = null;
                                memberValue.endTime = null;
                                memberValue.timezone = null;
                                manageVisibility(false, memberHasCallTimes);
                            }}
                        >
                            Remove on-call duty times
                        </button>
                    </div>
                </div>
            )}

            <ShouldRender if={fields.length > 1}>
                <div className="bs-Fieldset-row">
                    <label className="bs-Fieldset-label"></label>
                    <div className="bs-Fieldset-fields">
                        <div className="Box-root Flex-flex Flex-alignItems--center">
                            <button
                                className="bs-Button bs-DeprecatedButton"
                                type="button"
                                onClick={() => fields.remove(nameIndex)}
                            >
                                Remove Member
                            </button>
                        </div>
                    </div>
                </div>
            </ShouldRender>
        </li>
    );
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type '({ ... Remove this comment to see the full error message
RenderMember.displayName = 'RenderMember';

const mapDispatchToProps = (dispatch: $TSFixMe) => {
    return bindActionCreators({ change }, dispatch);
};

function mapStateToProps(state: $TSFixMe) {
    const selector = formValueSelector('OnCallAlertBox');
    const form = selector(state, 'OnCallAlertBox');
    const formValues = state.form.OnCallAlertBox?.values;

    return {
        form,
        projectGroups: state.groups.oncallDuty,
        formValues,
    };
}
// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type '({ me... Remove this comment to see the full error message
RenderMember.propTypes = {
    subProjectId: PropTypes.string.isRequired,
    fields: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    policyIndex: PropTypes.number.isRequired,
    teamIndex: PropTypes.number.isRequired,
    nameIndex: PropTypes.number.isRequired,
    memberValue: PropTypes.object.isRequired,
    inputarray: PropTypes.string.isRequired,
    change: PropTypes.func,
    form: PropTypes.object,
    projectGroups: PropTypes.array,
    formValues: PropTypes.object,
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'ConnectedComponent<({ memberValue, inputarra... Remove this comment to see the full error message
RenderMember = connect(mapStateToProps, mapDispatchToProps)(RenderMember);
export { RenderMember };