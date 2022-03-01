import React, { Component } from 'react';
import Button from '../basic/Button';
import PropTypes from 'prop-types';
export default class TableActionButtons extends Component {
    constructor(props: $TSFixMe) {
        super(props);
    }

    render() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'actionButtons' does not exist on type 'R... Remove this comment to see the full error message
        const { actionButtons, item } = this.props;

        return (
            <td className="Table-cell Table-cell--align--left Table-cell--verticalAlign--top Table-cell--width--minimized Table-cell--wrap--wrap db-ListViewItem-cell db-ListViewItem-cell--breakWord">
                {actionButtons &&
                    actionButtons.map((actionButton: $TSFixMe, i: $TSFixMe) => {
                        return (
                            <div
                                key={i}
                                className="db-ListViewItem-cellContent Box-root Padding-all--8 table-view-item-btn-cell"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <span className="db-ListViewItem-text Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                    <div
                                        className="Box-root"
                                        style={{ marginRight: '4px' }}
                                    >
                                        <Button
                                            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: any; id: any; onClick: () => any; d... Remove this comment to see the full error message
                                            title={actionButton.title}
                                            id={actionButton.id}
                                            onClick={() =>
                                                actionButton.onClick &&
                                                actionButton.onClick(item)
                                            }
                                            disabled={actionButton.disabled}
                                        />
                                    </div>
                                </span>
                            </div>
                        );
                    })}
            </td>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
TableActionButtons.propTypes = {
    item: PropTypes.object.isRequired,
    actionButtons: PropTypes.array,
};