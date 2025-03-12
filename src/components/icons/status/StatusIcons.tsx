import React from 'react';
import IconBase from '../shared/IconBase';

export const ConnectedIcon: React.FC = () => (
  <IconBase size={12}>
    <circle cx="6" cy="6" r="5" fill="#10a37f" />
  </IconBase>
);

export const ErrorIcon: React.FC = () => (
  <IconBase size={12}>
    <circle cx="6" cy="6" r="5" fill="#e91e63" />
  </IconBase>
);

export const IdleIcon: React.FC = () => (
  <IconBase size={12}>
    <circle cx="6" cy="6" r="5" stroke="#888" strokeWidth="1.5" fill="none" />
  </IconBase>
);