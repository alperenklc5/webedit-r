import React from 'react';
import { useNode } from '@craftjs/core';

export const Container = ({ children, padding = '16px', background = '#1e1e1e', minHeight = '100px', ...props }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        padding,
        background,
        minHeight,
        border: '1px solid #333',
        borderRadius: '4px',
        position: 'relative',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    padding: { type: 'text', default: '16px' },
    background: { type: 'color', default: '#1e1e1e' },
    minHeight: { type: 'text', default: '100px' },
  },
};
