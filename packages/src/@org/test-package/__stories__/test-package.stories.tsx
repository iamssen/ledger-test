import { TestComponent } from '@org/test-package';
import { Meta } from '@storybook/react';
import React from 'react';

export default {
  title: 'Test',
} as Meta;

export const Basic = () => {
  return <TestComponent text="Hello World!" />;
};
