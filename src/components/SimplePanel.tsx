import React from 'react';
import { DataFrameView, FieldType, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { Activity } from '../types'; // Assurez-vous que votre type Activity est bien défini
import { Globe } from './Globe';
import { PanelDataErrorView } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const frame = data.series[0];

  // const timeField = frame.fields.find((field) => field.type === FieldType.time);
  // const valueField = frame.fields.find((field) => field.type === FieldType.number);

  // console.log('timestamps', timeField);
  // console.log('values', valueField);
  // console.log('+++++++++++++++++++++++++++++++++++++');
  const view = new DataFrameView(frame);

  // Initialise le tableau des activités
  const activities: Activity[] = [];

  view.forEach((row) => {
    // Appel des getters pour récupérer les valeurs des champs
    const latValue = row.lat; // Appeler la méthode getter pour obtenir la valeur
    const lngValue = row.lng; // Appeler la méthode getter pour obtenir la valeur
    const timestampValue = row.timestamp; // Idem pour timestamp
    const typeValue = row.type; // Et pour le type
    // Ajout de l'activité au tableau des activités
    activities.push({
      id: row.id,
      lat: latValue,
      lng: lngValue,
      timestamp: timestampValue,
      type: typeValue,
    });
  });
  console.log('-----------------------------------------------');

  return (
    <div style={{ height: height, width: width }}>
      {/* Envoi des activités au composant Globe */}
      <Globe activities={activities} />
    </div>
  );
};
