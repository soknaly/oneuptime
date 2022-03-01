import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { ListLoader } from '../basic/Loader';
import { history } from '../../store';

export class ProjectList extends Component {
    render() {
        if (
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects.skip &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            typeof this.props.projects.skip === 'string'
        ) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects.skip = parseInt(this.props.projects.skip, 10);
        }
        if (
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects.limit &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            typeof this.props.projects.limit === 'string'
        ) {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects.limit = parseInt(this.props.projects.limit, 10);
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
        if (!this.props.projects.skip) this.props.projects.skip = 0;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
        if (!this.props.projects.limit) this.props.projects.limit = 0;

        let canNext =
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects.count &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects.count >
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                this.props.projects.skip + this.props.projects.limit
                ? true
                : false;
        let canPrev =
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects && this.props.projects.skip <= 0 ? false : true;

        if (
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            this.props.projects &&
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'requesting' does not exist on type 'Read... Remove this comment to see the full error message
            (this.props.requesting || !this.props.projects.projects)
        ) {
            canNext = false;
            canPrev = false;
        }
        const numberOfPages = Math.ceil(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
            parseInt(this.props.projects && this.props.projects.count) / 10
        );
        return (
            <div>
                <div style={{ overflow: 'hidden', overflowX: 'auto' }}>
                    <table className="Table">
                        <thead className="Table-body">
                            <tr className="Table-row db-ListViewItem db-ListViewItem-header">
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px', minWidth: '270px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Project ID</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px', minWidth: '270px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Project Name</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-align--right Text-color--dark Text-display--block Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Users</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    id="placeholder-left"
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{
                                        height: '1px',
                                        maxWidth: '48px',
                                        minWidth: '48px',
                                        width: '48px',
                                    }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
                                    </div>
                                </td>
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Status</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    id="placeholder-right"
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{
                                        height: '1px',
                                        maxWidth: '48px',
                                        minWidth: '48px',
                                        width: '48px',
                                    }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
                                    </div>
                                </td>
                                <td
                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-color--dark Text-display--inline Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap">
                                            <span>Created At</span>
                                        </span>
                                    </div>
                                </td>
                                <td
                                    id="overflow"
                                    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; id: string; type: strin... Remove this comment to see the full error message
                                    type="action"
                                    className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                    style={{ height: '1px' }}
                                >
                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                        <span className="db-ListViewItem-text Text-align--right Text-color--dark Text-display--block Text-fontSize--13 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--upper Text-wrap--wrap"></span>
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody className="Table-body">
                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'requesting' does not exist on type 'Read... Remove this comment to see the full error message
                            {this.props.requesting ? (
                                <Fragment>
                                    <tr className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink">
                                        <td
                                            colSpan={7}
                                            className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                            style={{ height: '1px' }}
                                        >
                                            <div className="db-ListViewItem-link">
                                                <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                    <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                        <div className="Box-root">
                                                            <ListLoader />
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </Fragment>
                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                            ) : this.props.projects &&
                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                              this.props.projects.projects &&
                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                              this.props.projects.projects.length > 0 ? (
                                // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                this.props.projects.projects.map(
                                    (project: $TSFixMe, index: $TSFixMe) => {
                                        const projectOwner =
                                            project.users.find(
                                                (user: $TSFixMe) => user.role === 'Owner'
                                            ) || project.users.length > 0
                                                ? project.users[0]
                                                : {};
                                        let usersDetail;
                                        if (project.users.length > 0) {
                                            if (project.users.length === 1) {
                                                usersDetail = `${projectOwner.name}`;
                                            } else if (
                                                project.users.length === 2
                                            ) {
                                                usersDetail = `${projectOwner.name} and 1 other`;
                                            } else {
                                                usersDetail = `${
                                                    projectOwner.name
                                                } and ${project.users.length -
                                                    1} others`;
                                            }
                                        } else {
                                            usersDetail = 'Not Added Yet';
                                        }

                                        return (
                                            <tr
                                                key={project._id}
                                                className="Table-row db-ListViewItem bs-ActionsParent db-ListViewItem--hasLink"
                                                id={`project_${index}`}
                                                onClick={() => {
                                                    history.push(
                                                        '/admin/projects/' +
                                                            project.slug
                                                    );
                                                }}
                                            >
                                                <td
                                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                    style={{
                                                        height: '1px',
                                                        minWidth: '270px',
                                                    }}
                                                >
                                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                        <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                            <div className="Box-root Margin-right--16">
                                                                <span
                                                                    className={
                                                                        'projectId'
                                                                    }
                                                                    id={`project-${project._id}`}
                                                                >
                                                                    {
                                                                        project._id
                                                                    }
                                                                </span>
                                                            </div>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord"
                                                    style={{
                                                        height: '1px',
                                                        minWidth: '270px',
                                                    }}
                                                >
                                                    <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                        <span className="db-ListViewItem-text Text-color--cyan Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                            <div className="Box-root Margin-right--16">
                                                                <span>
                                                                    {
                                                                        project.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                    style={{
                                                        height: '1px',
                                                    }}
                                                >
                                                    <div className="db-ListViewItem-link">
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                <div className="Box-root">
                                                                    <span>
                                                                        {
                                                                            usersDetail
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    aria-hidden="true"
                                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                    style={{
                                                        height: '1px',
                                                        maxWidth: '48px',
                                                        minWidth: '48px',
                                                        width: '48px',
                                                    }}
                                                >
                                                    <div className="db-ListViewItem-link">
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            ⁣
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                    style={{ height: '1px' }}
                                                >
                                                    <div className="db-ListViewItem-link">
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            <span className="db-ListViewItem-text Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                <div className="Box-root Flex-flex">
                                                                    <div className="Box-root Flex-flex">
                                                                        <div className="db-RadarRulesListUserName Box-root Flex-flex Flex-alignItems--center Flex-direction--row Flex-justifyContent--flexStart">
                                                                            {project.deleted ? (
                                                                                <div className="Badge Badge--color--red Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                    <span className="Badge-text Text-color--red Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap">
                                                                                        <span>
                                                                                            Deleted
                                                                                        </span>
                                                                                    </span>
                                                                                </div>
                                                                            ) : project.isBlocked ? (
                                                                                <div className="Badge Badge--color--yellow Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                    <span className="Badge-text Text-color--yellow Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap">
                                                                                        <span>
                                                                                            Blocked
                                                                                        </span>
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="Badge Badge--color--green Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                                                                                    <span className="Badge-text Text-color--green Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap">
                                                                                        <span>
                                                                                            Active
                                                                                        </span>
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td
                                                    aria-hidden="true"
                                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                    style={{
                                                        height: '1px',
                                                        maxWidth: '48px',
                                                        minWidth: '48px',
                                                        width: '48px',
                                                    }}
                                                >
                                                    <div className="db-ListViewItem-link">
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            ⁣
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--noWrap db-ListViewItem-cell"
                                                    style={{ height: '1px' }}
                                                >
                                                    <div className="db-ListViewItem-link">
                                                        <div className="db-ListViewItem-cellContent Box-root Padding-all--8">
                                                            {moment(
                                                                project.createdAt
                                                            ).fromNow()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="Table-cell Table-cell--align--right Table-cell--verticalAlign--top Table-cell--wrap--noWrap db-ListViewItem-cell"></td>
                                            </tr>
                                        );
                                    }
                                )
                            ) : (
                                <tr></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                    {this.props.projects &&
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                    (!this.props.projects.projects ||
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                        !this.props.projects.projects.length) &&
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'requesting' does not exist on type 'Read... Remove this comment to see the full error message
                    !this.props.requesting &&
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                    !this.props.projects.error
                        ? "We don't have any projects yet"
                        : null}
                    // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                    {this.props.projects && this.props.projects.error
                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                        ? this.props.projects.error
                        : null}
                </div>
                <div className="Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween">
                    <div className="Box-root Flex-flex Flex-alignItems--center Padding-all--20">
                        <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--regular Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                            <span>
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--14 Text-fontWeight--medium Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                    {numberOfPages > 0
                                        ? `Page ${
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'page' does not exist on type 'Readonly<{... Remove this comment to see the full error message
                                              this.props.page
                                          } of ${numberOfPages} (${this.props
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              .projects &&
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              this.props.projects
                                                  .count} Project${
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              this.props.projects &&
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              this.props.projects.count === 1
                                                  ? ''
                                                  : 's'
                                          })`
                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                        : this.props.projects &&
                                          // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                          this.props.projects.count
                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                        ? `${this.props.projects &&
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              this.props.projects
                                                  .count} Project${
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              this.props.projects &&
                                              // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                              this.props.projects.count === 1
                                                  ? ''
                                                  : 's'
                                          }`
                                        : null}
                                </span>
                            </span>
                        </span>
                    </div>
                    <div className="Box-root Padding-horizontal--20 Padding-vertical--16">
                        <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart">
                            <div className="Box-root Margin-right--8">
                                <button
                                    id="btnPrev"
                                    onClick={() => {
                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'prevClicked' does not exist on type 'Rea... Remove this comment to see the full error message
                                        this.props.prevClicked(
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                            this.props.projects.skip,
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                            this.props.projects.limit
                                        );
                                    }}
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
                                    id="btnNext"
                                    onClick={() => {
                                        // @ts-expect-error ts-migrate(2339) FIXME: Property 'nextClicked' does not exist on type 'Rea... Remove this comment to see the full error message
                                        this.props.nextClicked(
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                            this.props.projects.skip,
                                            // @ts-expect-error ts-migrate(2339) FIXME: Property 'projects' does not exist on type 'Readon... Remove this comment to see the full error message
                                            this.props.projects.limit
                                        );
                                    }}
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
        );
    }
}

const mapDispatchToProps = (dispatch: $TSFixMe) => {
    return bindActionCreators({}, dispatch);
};

function mapStateToProps(state: $TSFixMe) {
    return {
        users: state.user.users.users,
    };
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
ProjectList.displayName = 'ProjectList';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ProjectList.propTypes = {
    nextClicked: PropTypes.func.isRequired,
    prevClicked: PropTypes.func.isRequired,
    projects: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    requesting: PropTypes.bool,
    page: PropTypes.number,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);