import * as buffer from 'buffer';

console.log('index.tsx..()', buffer);

//@ts-ignore
window.Buffer = buffer.Buffer;

//@ts-ignore
window.global = window;

import('./app');
