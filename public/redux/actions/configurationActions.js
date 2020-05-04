/*
 * Wazuh app - React component for registering agents.
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

export const updateConfigurationSection = section => {
  return {
    type: 'UPDATE_CONFIGURATION_SECTION',
    section
  };
};

export const updateClusterNodes = clusterNodes => {
  return {
    type: 'UPDATE_CONFIGURATION_CLUSTER_NODES',
    clusterNodes
  };
};

export const updateClusterNodeSelected = clusterNodeSelected => {
  return {
    type: 'UPDATE_CONFIGURATION_CLUSTER_NODE_SELECTED',
    clusterNodeSelected
  };
};

export const updateLoadingStatus = loadingStatus => {
  return {
    type: 'UPDATE_CONFIGURATION_LOADING_STATUS',
    loadingStatus
  };
};

export const updateAdminMode = adminMode => {
  return {
    type: 'UPDATE_CONFIGURATION_ADMIN_MODE',
    adminMode
  };
};