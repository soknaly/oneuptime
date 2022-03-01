/* eslint-disable */
import React, { Component } from 'react';

class UnLicensedAlert extends Component {
    render() {
        return (
            <div className="Box-root Margin-vertical--12">
                <div className="db-Trends bs-ContentSection Card-root Card-shadow--small">
                    <div className="Box-root Box-background--red4">
                        <div className="bs-ContentSection-content Box-root Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                            <span className="ContentHeader-title Text-color--white Text-fontSize--15 Text-fontWeight--regular Text-lineHeight--16">
                                <span>
                                    OneUptime is currently running on an
                                    evaluation license. To buy a commercial
                                    license, please email us at sales@oneuptime.com.
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
UnLicensedAlert.displayName = 'UnLicensedAlert';

export default UnLicensedAlert;