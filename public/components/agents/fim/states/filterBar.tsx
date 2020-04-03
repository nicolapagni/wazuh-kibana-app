/*
 * Wazuh app - Integrity monitoring components
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import { WzSearchBar, qSuggests } from '../../../../components/wz-search-bar'
import { getFilterValues } from './lib';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSuperDatePicker,
  OnTimeChangeProps,
} from '@elastic/eui';
import dateMath from '@elastic/datemath';
export class FilterBar extends Component {
  suggestions: qSuggests[] = [
    {label: 'file', values: async (value) => getFilterValues('file', value)},
    {label: 'perm', values: async (value) => getFilterValues('perm', value)},
    {label: 'uname', values: async (value) => getFilterValues('uname', value)},
    {label: 'uid', values: async (value) => getFilterValues('uid', value)},
    {label: 'gname', values: async (value) => getFilterValues('gname', value)},
    {label: 'gid', values: async (value) => getFilterValues('gid', value)},
    {label: 'md5', values: async (value) => getFilterValues('md5', value)},
    {label: 'date', values: async (value) => getFilterValues('date', value)},
    {label: 'sha1', values: async (value) => getFilterValues('sha1', value)},
    {label: 'sha256', values: async (value) => getFilterValues('sha256', value)},
    {label: 'mtime', values: async (value) => getFilterValues('mtime', value)},
    {label: 'inode', values: async (value) => getFilterValues('inode', value)},
    {label: 'size', values: value => !!value ? [value] : [0]}, // TODO: Adapt code to return and array with description
  ]

  state: {
    datePicker: OnTimeChangeProps,
    filterBar: {}
  }

  props!:{
    onFiltersChange: Function
    onDateChange(props:OnTimeChangeProps):() => void
  }

  constructor(props) {
    super(props);
    this.state = {
      datePicker: {
        start: "now/d", 
        end: "now/d",
        isQuickSelection: true,
        isInvalid: false,
      },
      filterBar: {}
    }
  }

  componentDidMount() {
    const { filterBar } = this.state;
    this.props.onFiltersChange(filterBar);
  }

  render() {
    const { datePicker } = this.state;
    const { onDateChange, onFiltersChange } = this.props;
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <WzSearchBar
            onInputChange={onFiltersChange}
            qSuggests={this.suggestions}
            apiSuggests={null}
            defaultFormat='qTags'
            placeholder='Add filter or search' />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSuperDatePicker  {...datePicker} onTimeChange={onDateChange} />
        </EuiFlexItem>
      </EuiFlexGroup>
    )
  }
}