import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'redu... Remove this comment to see the full error message
import { reduxForm, Field, reset } from 'redux-form';
import { ValidateField } from '../../config';
import { RenderField } from '../basic/RenderField';
import { RenderSelect } from '../basic/RenderSelect';
import { FormLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { addContainerSecurity } from '../../actions/security';
import { getDockerCredentials } from '../../actions/credential';
import { openModal } from '../../actions/modal';
import DockerCredentialModal from '../credential/DockerCredentialModal';

class ContainerSecurityForm extends Component {
    componentDidMount() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projectId' does not exist on type 'Reado... Remove this comment to see the full error message
        const { projectId, getDockerCredentials } = this.props;
        if (projectId) {
            getDockerCredentials({ projectId });
        }
    }
    componentDidUpdate(prevProps: $TSFixMe) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projectId' does not exist on type 'Reado... Remove this comment to see the full error message
        if (prevProps.projectId !== this.props.projectId) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projectId' does not exist on type 'Reado... Remove this comment to see the full error message
            const { projectId, getDockerCredentials } = this.props;
            if (projectId) {
                getDockerCredentials({ projectId });
            }
        }
    }

    submitForm = (values: $TSFixMe, dispatch: $TSFixMe) => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'componentId' does not exist on type 'Rea... Remove this comment to see the full error message
        const { componentId, projectId, addContainerSecurity } = this.props;
        if (!values) return;

        addContainerSecurity({ projectId, componentId, data: values });

        dispatch(reset('ContainerSecurityForm'));
    };

    handleDockerCredential = () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'openModal' does not exist on type 'Reado... Remove this comment to see the full error message
        const { openModal, projectId } = this.props;

        openModal({
            id: projectId,
            content: DockerCredentialModal,
            propArr: [{ projectId }],
        });
    };

    render() {
        const {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'handleSubmit' does not exist on type 'Re... Remove this comment to see the full error message
            handleSubmit,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'addingContainer' does not exist on type ... Remove this comment to see the full error message
            addingContainer,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'addContainerError' does not exist on typ... Remove this comment to see the full error message
            addContainerError,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'requestingDockerCredentials' does not ex... Remove this comment to see the full error message
            requestingDockerCredentials,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'dockerCredentials' does not exist on typ... Remove this comment to see the full error message
            dockerCredentials,
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'resourceCategoryList' does not exist on ... Remove this comment to see the full error message
            resourceCategoryList,
        } = this.props;

        return (
            <div className="Box-root Margin-bottom--12">
                <div className="bs-ContentSection Card-root Card-shadow--medium">
                    <div className="Box-root">
                        <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                            <div className="Box-root">
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>
                                        <span>Container Security</span>
                                    </span>
                                </span>
                                <p>
                                    <span>
                                        Check the security of your docker
                                        containers
                                    </span>
                                </p>
                            </div>
                        </div>
                        <form
                            id="containerSecurityForm"
                            onSubmit={handleSubmit(this.submitForm)}
                        >
                            <div
                                className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-vertical--2"
                                style={{ boxShadow: 'none' }}
                            >
                                <div>
                                    <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                        <fieldset className="bs-Fieldset">
                                            <div className="bs-Fieldset-rows">
                                                <div className="bs-container-input">
                                                    <label className="bs-Fieldset-label Fieldset-extra">
                                                        Name
                                                    </label>
                                                    <div className="bs-Fieldset-fields">
                                                        <Field
                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                            component={
                                                                RenderField
                                                            }
                                                            type="text"
                                                            name="name"
                                                            id="name"
                                                            placeholder="Container name"
                                                            disabled={
                                                                addingContainer
                                                            }
                                                            validate={
                                                                ValidateField.text
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <ShouldRender
                                                    if={
                                                        false &&
                                                        resourceCategoryList &&
                                                        resourceCategoryList.length >
                                                            0
                                                    }
                                                >
                                                    <div className="bs-container-input">
                                                        <label className="bs-Fieldset-label Fieldset-extra">
                                                            Resource Category
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <Field
                                                                className="db-select-nw"
                                                                component={
                                                                    RenderSelect
                                                                }
                                                                name="resourceCategory"
                                                                id="resourceCategory"
                                                                placeholder="Choose Category"
                                                                disabled={
                                                                    addingContainer
                                                                }
                                                                options={[
                                                                    {
                                                                        value:
                                                                            '',
                                                                        label:
                                                                            'Select category',
                                                                    },
                                                                    ...(resourceCategoryList &&
                                                                    resourceCategoryList.length >
                                                                        0
                                                                        ? resourceCategoryList.map(
                                                                              (category: $TSFixMe) => ({
                                                                                  value:
                                                                                      category._id,

                                                                                  label:
                                                                                      category.name
                                                                              })
                                                                          )
                                                                        : []),
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </ShouldRender>
                                                <div className="bs-container-input">
                                                    <label className="bs-Fieldset-label Fieldset-extra">
                                                        Docker Credential
                                                    </label>
                                                    <div className="bs-Fieldset-fields">
                                                        <Field
                                                            className="db-select-nw"
                                                            component={
                                                                RenderSelect
                                                            }
                                                            name="dockerCredential"
                                                            id="dockerCredential"
                                                            placeholder="Docker Credential"
                                                            required="required"
                                                            style={{
                                                                height: '28px',
                                                            }}
                                                            options={[
                                                                {
                                                                    value: '',
                                                                    label:
                                                                        'Select a Docker Credential',
                                                                },
                                                                ...(dockerCredentials &&
                                                                dockerCredentials.length >
                                                                    0
                                                                    ? dockerCredentials.map(
                                                                          (dockerCredential: $TSFixMe) => ({
                                                                              value:
                                                                                  dockerCredential._id,

                                                                              label:
                                                                                  dockerCredential.dockerUsername
                                                                          })
                                                                      )
                                                                    : []),
                                                            ]}
                                                        />
                                                        <p
                                                            className="bs-Fieldset-explanation"
                                                            style={{
                                                                color:
                                                                    '#4c4c4c',
                                                                textDecoration:
                                                                    'underline',
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                        >
                                                            <span
                                                                id="addCredentialBtn"
                                                                onClick={
                                                                    this
                                                                        .handleDockerCredential
                                                                }
                                                            >
                                                                Add a docker
                                                                credential
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bs-container-input">
                                                    <label className="bs-Fieldset-label Fieldset-extra">
                                                        Image Path
                                                    </label>
                                                    <div className="bs-Fieldset-fields">
                                                        <Field
                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                            component={
                                                                RenderField
                                                            }
                                                            type="text"
                                                            name="imagePath"
                                                            id="imagePath"
                                                            placeholder="oneuptime/home"
                                                            disabled={
                                                                addingContainer
                                                            }
                                                            validate={
                                                                ValidateField.text
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bs-container-input">
                                                    <label className="bs-Fieldset-label Fieldset-extra">
                                                        Image Tags
                                                    </label>
                                                    <div className="bs-Fieldset-fields">
                                                        <Field
                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                            component={
                                                                RenderField
                                                            }
                                                            type="text"
                                                            name="imageTags"
                                                            id="imageTags"
                                                            placeholder="latest"
                                                            disabled={
                                                                addingContainer
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                            <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                                <div className="bs-Tail-copy">
                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                                        <ShouldRender
                                            if={
                                                !addingContainer &&
                                                addContainerError
                                            }
                                        >
                                            <div className="Box-root Margin-right--8">
                                                <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                                            </div>
                                            <div className="Box-root">
                                                <span style={{ color: 'red' }}>
                                                    {addContainerError}
                                                </span>
                                            </div>
                                        </ShouldRender>
                                    </div>
                                </div>
                                <div>
                                    <ShouldRender
                                        if={
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'showCancelBtn' does not exist on type 'R... Remove this comment to see the full error message
                                            this.props.showCancelBtn &&
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'toggleForm' does not exist on type 'Read... Remove this comment to see the full error message
                                            this.props.toggleForm
                                        }
                                    >
                                        <button
                                            className="bs-Button"
                                            disabled={
                                                addingContainer ||
                                                requestingDockerCredentials
                                            }
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'toggleForm' does not exist on type 'Read... Remove this comment to see the full error message
                                            onClick={this.props.toggleForm}
                                            type="button"
                                        >
                                            <span>Cancel</span>
                                        </button>
                                    </ShouldRender>
                                    <button
                                        id="addContainerBtn"
                                        className="bs-Button bs-Button--blue"
                                        disabled={
                                            addingContainer ||
                                            requestingDockerCredentials
                                        }
                                        type="submit"
                                    >
                                        <ShouldRender if={!addingContainer}>
                                            <span>Add Container</span>
                                        </ShouldRender>

                                        <ShouldRender if={addingContainer}>
                                            <FormLoader />
                                        </ShouldRender>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
ContainerSecurityForm.displayName = 'Container Security Form';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ContainerSecurityForm.propTypes = {
    addContainerSecurity: PropTypes.func,
    handleSubmit: PropTypes.func,
    componentId: PropTypes.string,
    projectId: PropTypes.string,
    addingContainer: PropTypes.bool,
    addContainerError: PropTypes.string,
    dockerCredentials: PropTypes.array,
    getDockerCredentials: PropTypes.func,
    requestingDockerCredentials: PropTypes.bool,
    openModal: PropTypes.func,
    resourceCategoryList: PropTypes.array,
    toggleForm: PropTypes.func,
    showCancelBtn: PropTypes.bool,
};

const mapDispatchToProps = (dispatch: $TSFixMe) => bindActionCreators(
    {
        addContainerSecurity,
        getDockerCredentials,
        openModal,
    },
    dispatch
);

const mapStateToProps = (state: $TSFixMe) => {
    return {
        addingContainer: state.security.addContainer.requesting,
        addContainerError: state.security.addContainer.error,
        dockerCredentials: state.credential.dockerCredentials,
        requestingDockerCredentials: state.credential.getCredential.requesting,
        resourceCategoryList:
            state.resourceCategories.resourceCategoryListForNewResource
                .resourceCategories,
    };
};

const NewContainerSecurityForm = reduxForm({
    form: 'ContainerSecurityForm',
    destroyOnUnmount: true,
    enableReinitialize: true,
})(ContainerSecurityForm);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewContainerSecurityForm);