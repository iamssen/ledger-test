import React from 'react';

export interface TestProps {
  text: string;
}

export function TestComponent({ text }: TestProps) {
  return <div>{text}</div>;
}

export function testFunction() {
  return 'hello';
}
