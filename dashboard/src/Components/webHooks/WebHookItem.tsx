import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { deleteWebHook, updateWebHook } from '../../actions/webHook';
import { openModal, closeModal } from 'common-ui/actions/modal';
import DeleteWebhook from '../modals/DeleteWebhook';
import EditWebhook from '../modals/EditWebhook';
import RenderIfAdmin from '../basic/RenderIfAdmin';
import DataPathHoC from '../DataPathHoC';
import { WebHookTableBody, WebHookBadgeTableBody } from './WebHookRow';

interface WebHookInputProps {
    currentProject: object;
    deleteWebHook: Function;
    openModal: Function;
    data: object;
    monitorId?: string;
    webhooks?: object;
    monitors?: unknown[];
    updateWebHook?: Function;
}

class WebHookInput extends React.Component<WebHookInputProps> {
    deleteItem = () => {
        const {

            monitors,

            monitorId,

            data,

            updateWebHook,

            currentProject,
        } = this.props;

        //check if monitorId is present
        //if the webhook contains more than one monitor just remove the monitor from it
        //if not delete the monitor
        if (monitorId) {
            const newMonitors = monitors
                .filter((monitor: $TSFixMe) => monitor.monitorId._id !== monitorId)
                .map((monitor: $TSFixMe) => ({
                    monitorId: monitor.monitorId._id
                }));

            if (newMonitors.length > 0) {
                const postObj = {};

                postObj.endpoint = data && data.data.endpoint;


                postObj.monitors = newMonitors;

                postObj.type = 'webhook';

                postObj.endpointType = data && data.data.endpointType;


                postObj.incidentCreated =
                    data && data.notificationOptions.incidentCreated;

                postObj.incidentResolved =
                    data && data.notificationOptions.incidentResolved;

                postObj.incidentAcknowledged =
                    data && data.notificationOptions.incidentAcknowledged;

                postObj.incidentNoteAdded =
                    data && data.notificationOptions.incidentNoteAdded;

                return updateWebHook(currentProject._id, data._id, postObj);
            } else {

                return this.props.deleteWebHook(currentProject._id, data._id);
            }
        } else {

            return this.props.deleteWebHook(currentProject._id, data._id);
        }
    };

    getMonitors(monitors: $TSFixMe) {
        const gt = (i: $TSFixMe) => monitors.length > i;

        let temp = gt(0) ? monitors[0].name : 'Not Yet Added';
        temp += gt(1)
            ? ` and ${monitors.length - 1} other${gt(2) ? 's' : ''}`
            : '';

        return temp;
    }

    override render() {

        const { data, webhooks, monitors, monitorId } = this.props;

        const { endpoint, endpointType } = data.data;
        let deleting = false;
        const monitorName = monitors && monitors[0].monitorId.name;
        const monitorTitle =
            monitors && monitors.length > 1
                ? `${monitorName} and ${monitors?.length - 1} other${monitors?.length - 1 === 1 ? '' : 's'
                }`
                : monitorName;
        if (
            webhooks &&
            webhooks.deleteWebHook &&
            webhooks.deleteWebHook.requesting
        ) {
            deleting = true;
        }

        return (
            <tr className="webhook-list-item Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink webhook-list">
                <WebHookTableBody text={endpoint} />

                {!monitorId && <WebHookTableBody text={monitorTitle} />}

                <WebHookBadgeTableBody
                    text={endpointType}

                    primary={endpointType === 'post'}
                />

                <td className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell">
                    <div
                        className="db-ListViewItem-cellContent Box-root Padding-all--12 Flex-alignContent--flexEnd"
                        style={{ marginLeft: '-5px' }}
                    >
                        <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <RenderIfAdmin>
                                <div className="Box-root">
                                    <button
                                        className="bs-Button bs-DeprecatedButton"
                                        type="button"
                                        onClick={() =>

                                            this.props.openModal({
                                                id: data._id,
                                                onClose: () => '',
                                                content: DataPathHoC(
                                                    EditWebhook,
                                                    {
                                                        ...data,
                                                        currentMonitorId: monitorId,
                                                    }
                                                ),
                                            })
                                        }
                                    >
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        className="bs-Button bs-DeprecatedButton"
                                        type="button"
                                        onClick={() =>

                                            this.props.openModal({
                                                id: data._id,
                                                onClose: () => '',
                                                onConfirm: () =>
                                                    this.deleteItem(),
                                                content: DataPathHoC(
                                                    DeleteWebhook,
                                                    { deleting }
                                                ),
                                            })
                                        }
                                    >
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </RenderIfAdmin>
                        </span>
                    </div>
                </td>
            </tr>
        );
    }
}


WebHookInput.displayName = 'WebHookInput';

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
    {
        deleteWebHook,
        updateWebHook,
        openModal,
        closeModal,
    },
    dispatch
);

const mapStateToProps = (state: RootState) => ({
    webhooks: state.webHooks,
    team: state.team,
    currentProject: state.project.currentProject
});


WebHookInput.propTypes = {
    currentProject: PropTypes.object.isRequired,
    deleteWebHook: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    monitorId: PropTypes.string,
    webhooks: PropTypes.object,
    monitors: PropTypes.array,
    updateWebHook: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(WebHookInput);