/*
 * Wazuh app - React component for Visualize.
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, Fragment } from 'react';

import { visualizations } from './visualizations';
import { agentVisualizations } from './agent-visualizations';
import KibanaVis from '../../kibana-integrations/kibana-vis';
import {
  EuiPage,
  EuiFlexGroup,
  EuiPanel,
  EuiFlexItem,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiCallOut,
  EuiLink
} from '@elastic/eui';
import WzReduxProvider from '../../redux/wz-redux-provider';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { WzRequest } from '../../react-services/wz-request';
import { CommonData } from '../../services/common-data';
import { checkAdminMode } from '../../controllers/management/components/management/configuration/utils/wz-fetch';
import { VisHandlers } from '../../factories/vis-handlers';
import { RawVisualizations } from '../../factories/raw-visualizations';
import { Metrics } from '../overview/metrics/metrics'

const visHandler = new VisHandlers();

export class WzVisualize extends Component {
  constructor(props) {
    super(props);
    this.visualizations = this.props.isAgent
      ? agentVisualizations
      : visualizations;
    this.state = {
      selectedTab: this.props.selectedTab,
      expandedVis: false,
      thereAreSampleAlerts: false,
      adminMode: false,
    };
    this.metricValues = false;
    this.rawVisualizations = new RawVisualizations();
    this.wzReq = WzRequest;
    const wazuhConfig = new WazuhConfig();
    this.commonData = new CommonData();
    const configuration = wazuhConfig.getConfig();
    this.monitoringEnabled = !!(configuration || {})[
      'wazuh.monitoring.enabled'
    ];
  }

  async componentDidMount() {
    this.agentsStatus = false;
    if (!this.monitoringEnabled) {
      const data = await this.wzReq.apiReq('GET', '/agents/summary', {});
      const result = ((data || {}).data || {}).data || false;
      if (result) {
        this.agentsStatus = [
          {
            title: 'Total',
            description: result.Total - 1
          },
          {
            title: 'Active',
            description: result.Active - 1
          },
          {
            title: 'Disconnected',
            description: result.Disconnected
          },
          {
            title: 'Never Connected',
            description: result['Never connected']
          },
          {
            title: 'Agents coverage',
            description:
              (result.Total - 1
                ? ((result.Active - 1) / (result.Total - 1)) * 100
                : 0) + '%'
          }
        ];
      }
    }

    // Check if there is sample alerts installed
    try {
      this.setState({
        thereAreSampleAlerts: (await WzRequest.genericReq('GET', '/elastic/samplealerts', {})).data.sampleAlertsInstalled
      });
    } catch (error) { }

    // Check adminMode
    try {
      const adminMode = await checkAdminMode();
      this.setState({ adminMode });
    } catch (error) { }
  }

  async componentDidUpdate(prevProps) {
    this.visualizations = this.props.isAgent && this.props.isAgent.length ? agentVisualizations : visualizations;
    const { selectedTab } = this.props;
    if (selectedTab !== this.state.selectedTab) {
      this.setState({
        selectedTab: selectedTab
      });
    }
    // when it changes no selected agent to selected or inverse, remove previous visualizations VisHanderls
    if ((!prevProps.isAgent && this.props.isAgent) || (prevProps.isAgent && !this.props.isAgent)) {
      visHandler.removeAll();
    }
  }

  expand = id => {
    this.setState({ expandedVis: this.state.expandedVis === id ? false : id });
  };

  render() {
    this.visualizations = this.rawVisualizations.getType() !== 'general' ? agentVisualizations : visualizations;
    const { selectedTab } = this.state;
    const renderVisualizations = vis => {
      return (
        <EuiFlexItem
          grow={parseInt((vis.width || 10) / 10)}
          key={vis.id}
          style={{ maxWidth: vis.width + '%', margin: 0, padding: 12 }}
        >
          <EuiPanel
            paddingSize="none"
            className={
              this.state.expandedVis === vis.id ? 'fullscreen h-100' : 'h-100'
            }
          >
            <EuiFlexItem className="h-100">
              <EuiFlexGroup
                style={{ padding: '12px 12px 0px' }}
                className="embPanel__header"
              >
                <h2 className="embPanel__title wz-headline-title">
                  {vis.title}
                </h2>
                <EuiButtonIcon
                  color="text"
                  style={{ padding: '0px 6px', height: 30 }}
                  onClick={() => this.expand(vis.id)}
                  iconType="expand"
                  aria-label="Expand"
                />
              </EuiFlexGroup>
              <div style={{ height: '100%' }}>
                {(vis.id !== 'Wazuh-App-Overview-General-Agents-status' ||
                  (vis.id === 'Wazuh-App-Overview-General-Agents-status' &&
                    this.monitoringEnabled)) && (
                    <WzReduxProvider>
                      <KibanaVis
                        visID={vis.id}
                        tab={selectedTab}
                        {...this.props}
                      ></KibanaVis>
                    </WzReduxProvider>
                  )}
                {vis.id === 'Wazuh-App-Overview-General-Agents-status' &&
                  !this.monitoringEnabled && (
                    <EuiPage style={{ background: 'transparent' }}>
                      <EuiDescriptionList
                        type="column"
                        listItems={this.agentsStatus}
                        style={{ maxWidth: '400px' }}
                      />
                    </EuiPage>
                  )}
              </div>
            </EuiFlexItem>
          </EuiPanel>
        </EuiFlexItem>
      );
    };

    const renderVisualizationRow = (rows, width, idx) => {
      return (
        <EuiFlexItem
          grow={(width || 10) / 10}
          key={idx}
          style={{ maxWidth: width + '%', margin: 0, padding: 12 }}
        >
          {rows.map((visRow, j) => {
            return (
              <EuiFlexGroup
                key={j}
                style={{
                  height: visRow.height || 0 + 'px',
                  marginBottom: visRow.noMargin ? '' : '4px'
                }}
              >
                {visRow.vis.map(visualizeRow => {
                  return renderVisualizations(visualizeRow);
                })}
              </EuiFlexGroup>
            );
          })}
        </EuiFlexItem>
      );
    };

    return (
      <Fragment>
        {/* Sample alerts Callout */}
        {this.state.thereAreSampleAlerts && this.props.resultState === 'ready' && (
          <EuiCallOut title='This dashboard contains sample data' color='warning' iconType='alert' style={{ margin: '0 8px 16px 8px' }}>
            <p>The data displayed may contain sample alerts. {this.state.adminMode && (
              <Fragment>
                Go <EuiLink href='#/settings?tab=sample_data' aria-label='go to configure sample data'>here</EuiLink> to configure the sample data.
              </Fragment>
            )}</p>
          </EuiCallOut>
        )}

        {this.props.resultState === 'none' && (
          <div className="wz-margin-top-10 wz-margin-right-8 wz-margin-left-8">
            <EuiCallOut title="There are no results for selected time range. Try another
                    one." color="warning" iconType='help'></EuiCallOut>
          </div>
        )}
        <EuiFlexItem className={this.props.resultState === 'none' && 'no-opacity' || ''}>

        <Metrics section={selectedTab} resultState={this.props.resultState} /> 

          {selectedTab &&
            selectedTab !== 'welcome' &&
            this.visualizations[selectedTab] &&
            this.visualizations[selectedTab].rows.map((row, i) => {
              return (
                <EuiFlexGroup
                  key={i}
                  style={{
                    display: row.hide && 'none',
                    height: row.height || 0 + 'px',
                    margin: 0,
                    maxWidth: '100%'
                  }}
                >
                  {row.vis.map((vis, n) => {
                    return !vis.hasRows
                      ? renderVisualizations(vis)
                      : renderVisualizationRow(vis.rows, vis.width, n);
                  })}
                </EuiFlexGroup>
              );
            })}
        </EuiFlexItem>
      </Fragment>
    );
  }
}
