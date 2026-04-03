import React from 'react';
import { useNode } from '@craftjs/core';

export const Text = ({ text = 'Edit me', fontSize = '16px', color = '#ffffff', textAlign = 'left', ...props }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <p
      ref={(ref) => connect(drag(ref))}
      style={{
        fontSize,
        color,
        textAlign,
        margin: 0,
        padding: '4px',
        cursor: 'text',
      }}
      {...props}
    >
      {text}
    </p>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: { type: 'text', default: 'Edit me' },
    fontSize: { type: 'text', default: '16px' },
    color: { type: 'color', default: '#ffffff' },
    textAlign: { type: 'select', default: 'left', options: ['left', 'center', 'right'] },
  },
};
