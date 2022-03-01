import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { openModal } from '../../actions/modal';
import DeleteContainerSecurity from '../modals/DeleteContainerSecurity';

export class ContainerSecurityDeleteBox extends Component {
    handleDelete = ({
        projectId,
        componentId,
        containerSecurityId,
        containerSecuritySlug,
        componentSlug
    }: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'openModal' does not exist on type 'Reado... Remove this comment to see the full error message
        const { openModal } = this.props;

        openModal({
            id: containerSecurityId,
            content: DeleteContainerSecurity,
            propArr: [
                {
                    projectId,
                    componentId,
                    containerSecurityId,
                    containerSecuritySlug,
                    componentSlug,
                },
            ],
        });
    };

    render() {
        const {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleting' does not exist on type 'Readon... Remove this comment to see the full error message
            deleting,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projectId' does not exist on type 'Reado... Remove this comment to see the full error message
            projectId,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'componentId' does not exist on type 'Rea... Remove this comment to see the full error message
            componentId,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'containerSecurityId' does not exist on t... Remove this comment to see the full error message
            containerSecurityId,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'containerSecuritySlug' does not exist on... Remove this comment to see the full error message
            containerSecuritySlug,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'componentSlug' does not exist on type 'R... Remove this comment to see the full error message
            componentSlug,
        } = this.props;

        return (
            <div className="Box-root Margin-bottom--12">
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <div className="Box-root">
                        <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                            <div className="Box-root">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>Delete Container Security</span>
                                </span>
                                <p>
                                    <span>
                                        Click the button to permanantly delete
                                        this container security.
                                    </span>
                                </p>
                            </div>
                            <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--0 Padding-vertical--12">
                                <span className="db-SettingsForm-footerMessage"></span>
                                <div>
                                    <button
                                        className="bs-Button bs-Button--red Box-background--red"
                                        id="deleteContainerSecurityBtn"
                                        disabled={deleting}
                                        onClick={() =>
                                            this.handleDelete({
                                                projectId,
                                                componentId,
                                                containerSecurityId,
                                                containerSecuritySlug,
                                                componentSlug,
                                            })
                                        }
                                    >
                                        <ShouldRender if={!deleting}>
                                            <span>Delete</span>
                                        </ShouldRender>
                                        <ShouldRender if={deleting}>
                                            <FormLoader />
                                        </ShouldRender>
                                    </button>
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
ContainerSecurityDeleteBox.displayName = 'ContainerSecurityDeleteBox';

const mapDispatchToProps = (dispatch: $TSFixMe) => bindActionCreators({ openModal }, dispatch);

const mapStateToProps = (state: $TSFixMe) => {
    return {
        deleting: state.security.deleteApplication.requesting,
    };
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ContainerSecurityDeleteBox.propTypes = {
    componentId: PropTypes.string.isRequired,
    componentSlug: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    containerSecurityId: PropTypes.string.isRequired,
    containerSecuritySlug: PropTypes.string,
    openModal: PropTypes.func.isRequired,
    deleting: PropTypes.bool,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContainerSecurityDeleteBox);