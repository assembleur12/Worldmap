import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { Activity } from '../types'; // Assurez-vous que votre type Activity est bien défini
import { Globe } from './Globe';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  // Génération structurée des activités à partir des données reçues
  const activities: Activity[] = data.series.map((series, index) => {
    return {
      id: index, // Identifiant unique de l'activité
      lat: Math.random() * 180 - 90, // Latitude aléatoire entre -90 et 90
      lng: Math.random() * 360 - 180, // Longitude aléatoire entre -180 et 180
      type: series.name === 'commit' ? 'commit' : series.name === 'pull_request' ? 'pull_request' : 'issue', // Type d'activité
      timestamp: Date.now().toString(), // Timestamp actuel en millisecondes
    };
  });

  console.log('Activités', activities);

  return (
    <div style={{ height: height, width: width }}>
      {/* Envoi des activités au composant Globe */}
      <Globe activities={activities} />
    </div>
  );
};
