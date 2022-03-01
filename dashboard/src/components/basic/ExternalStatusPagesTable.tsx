import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataPathHoC from '../DataPathHoC';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'uuid... Remove this comment to see the full error message
import { v4 as uuidv4 } from 'uuid';
import EditExternalStatusPageModal from '../modals/EditExternalStatusPageModal';
import RemoveExternalStatusPage from '../modals/RemoveExternalStatusPage';
import { openModal } from '../../actions/modal';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

export class ExternalStatusPagesTable extends Component {
    state = {
        deleteExternalStatusPageModalId: uuidv4(),
    };
    render() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'statusPage' does not exist on type 'Read... Remove this comment to see the full error message
        const { statusPage, openModal } = this.props;
        const { deleteExternalStatusPageModalId } = this.state;

        return (
            <div className="bs-ContentSection-content Box-root">
                <div className="bs-ObjectList db-UserList">
                    <div
                        style={{
                            overflow: 'hidden',
                            overflowX: 'auto',
                        }}
                    >
                        <div className="bs-ObjectList-rows">
                            <header className="bs-ObjectList-row bs-ObjectList-row--header">
                                <div className="bs-ObjectList-cell">Name</div>
                                <div className="bs-ObjectList-cell">Url</div>
                                <div
                                    className="bs-ObjectList-cell"
                                    style={{
                                        float: 'right',
                                        marginRight: '10px',
                                    }}
                                >
                                    Action
                                </div>
                            </header>
                            {statusPage.externalStatusPages.externalStatusPagesList.map(
                                (link: $TSFixMe, i: $TSFixMe) => {
                                    return (
                                        <div
                                            key={i}
                                            className="scheduled-event-list-item bs-ObjectList-row db-UserListRow db-UserListRow--withName"
                                            style={{
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div
                                                className="bs-ObjectList-cell bs-u-v-middle"
                                                style={{
                                                    width: '15vw',
                                                    whiteSpace: 'normal',
                                                }}
                                            >
                                                <div className="bbs-ObjectList-cell-row">
                                                    {link.name}
                                                </div>
                                            </div>

                                            <div className="bs-ObjectList-cell bs-u-v-middle">
                                                <div className="bs-ObjectList-cell-row">
                                                    {link.url}
                                                </div>
                                            </div>

                                            <div className="bs-ObjectList-cell bs-u-v-middle">
                                                <div className="Box-root Flex-flex Flex-justifyContent--flexEnd">
                                                    <button
                                                        title="edit"
                                                        className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--edit"
                                                        type="button"
                                                        style={{
                                                            marginLeft: 20,
                                                        }}
                                                        onClick={() =>
                                                            openModal({
                                                                id: deleteExternalStatusPageModalId,
                                                                content: DataPathHoC(
                                                                    EditExternalStatusPageModal,
                                                                    { link }
                                                                ),
                                                            })
                                                        }
                                                    >
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        title="delete"
                                                        className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--delete"
                                                        type="button"
                                                        style={{
                                                            marginLeft: 20,
                                                        }}
                                                        onClick={() => {
                                                            openModal({
                                                                id: deleteExternalStatusPageModalId,
                                                                content: DataPathHoC(
                                                                    RemoveExternalStatusPage,
                                                                    { link }
                                                                ),
                                                            });
                                                        }}
                                                    >
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
ExternalStatusPagesTable.displayName = 'ExternalStatusPagesTable';

const mapDispatchToProps = (dispatch: $TSFixMe) => {
    return bindActionCreators(
        {
            openModal,
        },
        dispatch
    );
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExternalStatusPagesTable.propTypes = {
    statusPage: PropTypes.object,
    openModal: PropTypes.func.isRequired,
};

export default connect(null, mapDispatchToProps)(ExternalStatusPagesTable);