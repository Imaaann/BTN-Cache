export interface Metrics {
  readCount: number;
  writeCount: number;
  readTime: number;
  writeTime: number;
}

export function createMetrics(): Metrics {
  return {
    readCount: 0,
    writeCount: 0,
    readTime: 0,
    writeTime: 0,
  };
}
