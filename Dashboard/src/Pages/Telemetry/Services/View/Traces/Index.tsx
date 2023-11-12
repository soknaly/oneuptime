import Route from 'Common/Types/API/Route';
import ModelPage from 'CommonUI/src/Components/Page/ModelPage';
import React, { FunctionComponent, ReactElement } from 'react';
import PageMap from '../../../../../Utils/PageMap';
import RouteMap, { RouteUtil } from '../../../../../Utils/RouteMap';
import PageComponentProps from '../../../../PageComponentProps';
import SideMenu from '../SideMenu';
import Navigation from 'CommonUI/src/Utils/Navigation';
import ObjectID from 'Common/Types/ObjectID';
import Service from 'Model/Models/Service';
import EmptyState from 'CommonUI/src/Components/EmptyState/EmptyState';
import IconProp from 'Common/Types/Icon/IconProp';

const ServiceDelete: FunctionComponent<PageComponentProps> = (
    _props: PageComponentProps
): ReactElement => {
    const modelId: ObjectID = Navigation.getLastParamAsObjectID(1);

    return (
        <ModelPage
            title="Service"
            modelType={Service}
            modelId={modelId}
            modelNameField="name"
            breadcrumbLinks={[
                {
                    title: 'Project',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.HOME] as Route,
                        { modelId }
                    ),
                },
                {
                    title: 'Telemetry',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.TELEMETRY] as Route,
                        { modelId }
                    ),
                },
                {
                    title: 'Services',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.TELEMETRY_SERVICES] as Route,
                        { modelId }
                    ),
                },
                {
                    title: 'View Service',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.TELEMETRY_SERVICES_VIEW] as Route,
                        { modelId }
                    ),
                },
                {
                    title: 'Traces',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[
                            PageMap.TELEMETRY_SERVICES_VIEW_TRACES
                        ] as Route,
                        { modelId }
                    ),
                },
            ]}
            sideMenu={<SideMenu modelId={modelId} />}
        >
            <EmptyState id="coming-soon" icon={IconProp.CursorArrowRays} title="Coming soon!" description="We will be launching this feature very soon. Stay Tuned!" />
        </ModelPage>
    );
};

export default ServiceDelete;
