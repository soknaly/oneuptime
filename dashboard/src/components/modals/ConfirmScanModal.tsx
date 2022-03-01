import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import ClickOutside from 'react-click-outside';
import { bindActionCreators } from 'redux';
import { closeModal } from '../../actions/modal';
import {
    scanContainerSecurity,
    scanApplicationSecurity,
} from '../../actions/security';

class ConfirmScanModal extends Component {
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }

    handleKeyBoard = (e: $TSFixMe) => {
        switch (e.key) {
            case 'Escape':
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'closeThisDialog' does not exist on type ... Remove this comment to see the full error message
                return this.props.closeThisDialog();
            case 'Enter':
                return this.handleScan();
            default:
                return false;
        }
    };

    handleScan = () => {
        const {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'closeModal' does not exist on type 'Read... Remove this comment to see the full error message
            closeModal,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'propArr' does not exist on type 'Readonl... Remove this comment to see the full error message
            propArr,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'scanContainerSecurity' does not exist on... Remove this comment to see the full error message
            scanContainerSecurity,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'scanApplicationSecurity' does not exist ... Remove this comment to see the full error message
            scanApplicationSecurity,
        } = this.props;
        const {
            projectId,
            containerSecurityId,
            applicationSecurityId,
        } = propArr[0];
        if (containerSecurityId) {
            scanContainerSecurity({ projectId, containerSecurityId });
        }
        if (applicationSecurityId) {
            scanApplicationSecurity({ projectId, applicationSecurityId });
        }
        return closeModal({ id: containerSecurityId });
    };

    render() {
        return (
            <div className="ModalLayer-wash Box-root Flex-flex Flex-alignItems--flexStart Flex-justifyContent--center">
                <div
                    className="ModalLayer-contents"
                    tabIndex={-1}
                    style={{ marginTop: 40 }}
                >
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'closeThisDialog' does not exist on type ... Remove this comment to see the full error message
                    <ClickOutside onClickOutside={this.props.closeThisDialog}>
                        <div className="bs-BIM">
                            <div className="bs-Modal bs-Modal--medium">
                                <div className="bs-Modal-header">
                                    <div className="bs-Modal-header-copy">
                                        <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                            <span>Confirm Scanning?</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="bs-Modal-content">
                                    <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                        Are you sure you want to scan your
                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'propArr' does not exist on type 'Readonl... Remove this comment to see the full error message
                                        {this.props.propArr[0].name}?
                                    </span>
                                </div>
                                <div className="bs-Modal-footer">
                                    <div className="bs-Modal-footer-actions">
                                        <button
                                            id="cancelScanModal"
                                            className="bs-Button bs-DeprecatedButton bs-Button--grey btn__modal"
                                            type="button"
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'closeThisDialog' does not exist on type ... Remove this comment to see the full error message
                                            onClick={this.props.closeThisDialog}
                                        >
                                            <span>Cancel</span>
                                            <span className="cancel-btn__keycode">
                                                Esc
                                            </span>
                                        </button>
                                        <button
                                            id="confirmScanModal"
                                            className="bs-Button bs-DeprecatedButton bs-Button--blue btn__modal"
                                            type="button"
                                            onClick={this.handleScan}
                                            autoFocus={true}
                                        >
                                            <span>Confirm</span>
                                            <span className="create-btn__keycode">
                                                <span className="keycode__icon keycode__icon--enter" />
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ClickOutside>
                </div>
            </div>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
ConfirmScanModal.displayName = 'ConfirmScanModal';
const mapStateToProps = () => ({});
// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ConfirmScanModal.propTypes = {
    closeThisDialog: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    scanContainerSecurity: PropTypes.func.isRequired,
    scanApplicationSecurity: PropTypes.func.isRequired,
    projectId: PropTypes.func.isRequired,
    propArr: PropTypes.array,
    containerSecurityId: PropTypes.func.isRequired,
};
const mapDispatchToProps = (dispatch: $TSFixMe) => bindActionCreators(
    { closeModal, scanContainerSecurity, scanApplicationSecurity },
    dispatch
);
export default connect(mapStateToProps, mapDispatchToProps)(ConfirmScanModal);