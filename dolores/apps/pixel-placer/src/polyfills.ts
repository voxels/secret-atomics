import * as buffer from 'node-stdlib-browser/mock/buffer';
import * as process from 'node-stdlib-browser/mock/process';

globalThis.Buffer = buffer.Buffer || buffer.default?.Buffer || buffer;
globalThis.process = process.default || process;
