# ctrlc-wrapper

Windows doesn't support sending signals to other processes as it is possible on POSIX platforms.

Using kill methods on Windows (like `process.kill()` from Node.js) means the target process is getting killed forcefully and abruptly (similar to `SIGKILL`).

However, in a console, processes can be terminated with the `CTRL`+`C` key combination.  
Most programming languages have an implementation to capture this event (usually as `SIGINT`), allowing applications to handle it and to terminate "gracefully".

The problem is that the `CTRL`+`C` key combination cannot be easily simulated for the following reasons:

- In order to be able to generate a CTRL+C signal programmatically, several [Console Functions](https://docs.microsoft.com/en-us/windows/console/console-functions) needs to be called - something which can only be done in lower-level programming languages.
- The process which should receive the CTRL+C signal needs to live in its own console since the CTRL+C signal is sent to all processes attached to a console. Spawning a process in a new console, again, is something which is only possible in lower-level programming languages.

This wrapper application does exactly the points described above.

The wrapper inherits `stdout`, `stderr` and the exit code from the child process and forwards `stdin` to it. If there's an error with the wrapper itself, the exit code is `-1`.

## Usage

```console
npm install ctrlc-wrapper
```

```js
import { spawnWithWrapper } from 'ctrlc-wrapper';

const child = spawnWithWrapper('node test/read-echo.js');

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  if (/READING/.test(data)) {
    child.sendCtrlC();
  }
});

child.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

child.on('close', (code, signal) => {
  console.log(`close: ${code} ${signal}`);
});
```

## Test

To start the child process `node test/read-echo.js` with the wrapper:

```console
go run ./cmd/start node test/read-echo.js
```

To terminate:

- Press `CTRL`+`C`
- Write `^C` to `stdin` (captured by the wrapper)
- Exit from within the child

## Build

```console
pnpm build
```

## Notes

### Why the separate `ctrlc.exe` binary?

It would be possible to send the CTRL+C signal directly from within `start.exe` but this means an additional process must be spawned (e.g. `cmd /c pause`) to prevent losing the original (parent) console during the console switch (`FreeConsole` -> `AttachConsole`). Using a separate binary to send the CTRL+C signal is the safer approach.

### `CREATE_NEW_CONSOLE` vs. `CREATE_NEW_PROCESS_GROUP`

Both methods seem to protect from receiving the CTRL+C signal in the current console.

However, spawning the child with `CREATE_NEW_PROCESS_GROUP` would mean that we need to start another "wrapper" in which the "normal processing of CTRL+C input" is enabled first (via `SetConsoleCtrlHandler`) before starting the actual child process.

### `CreateRemoteThread`

Instead of `ctrlc.exe` we might be able to terminate the target process by inject a thread into it, but this seems to be overly complicated...
