import { spawn } from 'node:child_process';

const port = process.env.PORT || '8080';
const host = process.env.HOST || '0.0.0.0';
const serveBin = process.platform === 'win32' ? 'serve.cmd' : 'serve';

const server = spawn(serveBin, ['--single', 'dist', '--listen', `tcp://${host}:${port}`], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

server.on('error', (error) => {
  console.error('No se pudo iniciar el servidor estático:', error.message);
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.kill(signal);
  });
}

server.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
