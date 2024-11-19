import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { Activity } from '../types'; // Assurez-vous que votre type Activity est bien défini
import { Globe } from './Globe';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const activities: Activity[] = data.series.map((series, index) => ({
    id: index,
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180,
    type: series.name === 'commit' ? 'commit' : series.name === 'pull_request' ? 'pull_request' : 'issue',
    timestamp: Date.now().toString(),
  }));

  return (
    <div style={{ height: '100%' }}>
      <Globe activities={activities} />
    </div>
  );
};
