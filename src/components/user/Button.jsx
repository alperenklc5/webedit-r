import React from 'react';
import { useNode } from '@craftjs/core';

export const Button = ({ text = 'Click me', background = '#007acc', color = '#ffffff', padding = '10px 20px', ...props }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <button
      ref={(ref) => connect(drag(ref))}
      style={{
        background,
        color,
        padding,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
      {...props}
    >
      {text}
    </button>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    text: { type: 'text', default: 'Click me' },
    background: { type: 'color', default: '#007acc' },
    color: { type: 'color', default: '#ffffff' },
    padding: { type: 'text', default: '10px 20px' },
  },
};
