process.on('SIGINT', () => {
  console.log('SIGINT');
  process.exit(0);
});

process.stdin.on('data', (chunk) => {
  const line = chunk.toString().trim();
  if (line === 'stop') {
    process.exit(0);
  }

  console.log(line);
});

console.log('READING');
