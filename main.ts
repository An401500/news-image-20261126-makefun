// news-image-20261126 — entry program (Node 22, standard library only).
//
// The deliverable is a newspaper front page, entry.png, that sums up the
// world's news of Thursday 26 November 2026. The image lives beside this
// file in the repository. This program does not draw anything: it proves
// the image is a complete, well-formed PNG, copies those exact bytes to
// the grader's output directory, and then proves the copy is identical.
// No network, no timestamps, no randomness — two runs write the same
// bytes, as the rules require.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_NAME = 'entry.png';
const DEFAULT_OUTPUT_DIR = '/output';

// Every PNG opens with these eight bytes.
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const CHUNK_IHDR = 'IHDR';
const CHUNK_IEND = 'IEND';

interface PngChunk {
  type: string;
  length: number;
  dataStart: number;
}

function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function fail(message: string): never {
  throw new Error(message);
}

// Split the bytes after the signature into their chunks. A chunk is a
// 4-byte big-endian length, a 4-byte type, the data, and a 4-byte CRC.
function readChunks(bytes: Buffer): PngChunk[] {
  const chunks: PngChunk[] = [];
  let offset = PNG_SIGNATURE.length;
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > bytes.length) {
      fail(`${SOURCE_NAME} has a chunk that runs past the end of the file`);
    }
    chunks.push({ type, length, dataStart: offset + 8 });
    offset = end;
    if (type === CHUNK_IEND) {
      break;
    }
  }
  return chunks;
}

// A PNG is whole only when it opens with the signature, its first chunk
// is IHDR (exactly 13 bytes of data), its last chunk is IEND, and the
// chunks together consume every byte of the file.
function assertWholePng(bytes: Buffer): void {
  if (bytes.length < PNG_SIGNATURE.length + 25) {
    fail(`${SOURCE_NAME} is too short to be a PNG (${bytes.length} bytes)`);
  }
  if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    fail(`${SOURCE_NAME} does not start with the PNG signature`);
  }
  const chunks = readChunks(bytes);
  if (chunks.length === 0 || chunks[0].type !== CHUNK_IHDR) {
    fail(`${SOURCE_NAME} has no IHDR chunk where a PNG must have one`);
  }
  if (chunks[0].length !== 13) {
    fail(`${SOURCE_NAME} IHDR chunk has the wrong length`);
  }
  const last = chunks[chunks.length - 1];
  if (last.type !== CHUNK_IEND) {
    fail(`${SOURCE_NAME} does not end with an IEND chunk`);
  }
  const consumed = last.dataStart + last.length + 4;
  if (consumed !== bytes.length) {
    fail(`${SOURCE_NAME} has trailing bytes after its IEND chunk`);
  }
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, SOURCE_NAME);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
  const target = join(outDir, SOURCE_NAME);

  const bytes = readFileSync(source);
  assertWholePng(bytes);

  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, target);

  // The copy must be exact: same size and same SHA-256 on both sides.
  const copied = readFileSync(target);
  if (copied.length !== bytes.length) {
    fail(`${SOURCE_NAME} copy has the wrong size`);
  }
  if (sha256Hex(copied) !== sha256Hex(bytes)) {
    fail(`${SOURCE_NAME} copy is not byte-identical`);
  }

  console.log(
    `${SOURCE_NAME}: ${bytes.length} bytes, sha256 ${sha256Hex(bytes)}, written to ${target}`,
  );
}

main();
