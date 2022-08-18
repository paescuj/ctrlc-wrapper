import {
  spawn,
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from 'child_process';

interface Wrapper extends ChildProcessWithoutNullStreams {
  sendCtrlC(): void;
}

function spawnWithWrapper(
  command: string,
  args?: readonly string[],
  options?: SpawnOptionsWithoutStdio
): Wrapper {
  if (process.platform === 'win32') {
    if (args) {
      (args as string[]).unshift(command);
    }
    const arch: Partial<Record<NodeJS.Architecture, string>> = {
      x64: '64',
      ia32: '32',
    };
    command = require.resolve(
      `ctrlc-wrapper-windows-${arch[process.arch]}/start.exe`
    );
  }
  const child = spawn(command, args, options) as Wrapper;
  child.sendCtrlC = () => {
    if (process.platform === 'win32') {
      child.stdin.write('^C\n');
    } else {
      child.kill('SIGINT');
    }
  };
  return child;
}

export { spawnWithWrapper };
