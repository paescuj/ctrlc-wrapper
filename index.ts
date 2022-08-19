import {
  spawn,
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from 'child_process';

interface WrapperChildProcessWithoutNullStreams
  extends ChildProcessWithoutNullStreams {
  sendCtrlC(): void;
}

function spawnWithWrapper(
  command: string,
  options?: SpawnOptionsWithoutStdio
): WrapperChildProcessWithoutNullStreams;
function spawnWithWrapper(
  command: string,
  args?: readonly string[],
  options?: SpawnOptionsWithoutStdio
): WrapperChildProcessWithoutNullStreams;

function spawnWithWrapper(
  command: string,
  argsOrOptions?: readonly string[] | SpawnOptionsWithoutStdio,
  options?: SpawnOptionsWithoutStdio
): WrapperChildProcessWithoutNullStreams {
  if (
    typeof argsOrOptions === 'object' &&
    !Array.isArray(argsOrOptions) &&
    argsOrOptions !== null
  ) {
    return spawnWithWrapper(
      command,
      [],
      argsOrOptions as SpawnOptionsWithoutStdio
    );
  }
  const args = (argsOrOptions || []) as string[];
  if (process.platform === 'win32') {
    args.unshift(command);
    const arch: Partial<Record<NodeJS.Architecture, string>> = {
      x64: '64',
      ia32: '32',
    };
    command = require.resolve(
      `ctrlc-wrapper-windows-${arch[process.arch]}/start.exe`
    );
  }
  const child = spawn(
    command,
    args,
    options
  ) as WrapperChildProcessWithoutNullStreams;
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
