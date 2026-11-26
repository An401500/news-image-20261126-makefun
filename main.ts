// news-image-20261126 — entry program (Node 22, standard library only).
//
// The entry is a newspaper front page, entry.png, summing up the world's
// news of Thursday 26 November 2026. The image sits next to this file in
// the repository. This program does one job: it checks that the image is
// a whole, well-formed PNG, copies those exact bytes to the grader's
// output directory, and then proves the copy is identical. It reads no
// network, writes no timestamps and uses no randomness, so two runs
// produce the same bytes, as the rules require.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_NAME = 'entry.png';

// The 8-byte signature every PNG starts with.
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
// The first chunk of a PNG must be IHDR; the last must be IEND.
const IHDR = Buffer.from('IHDR', 'ascii');
const IEND = Buffer.from('IEND', 'ascii');

function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

// Read the 4-byte big-endian length and the 4-byte type of the chunk
// that starts at `offset`, and return where the next chunk begins.
function nextChunk(bytes: Buffer, offset: number): number {
  const length = bytes.readUInt32BE(offset);
  const type = bytes.subarray(offset + 4, offset + 8);
  if (type.equals(IHDR) && length !== 13) {
    throw new Error('IHDR chunk has the wrong length');
  }
  // length + type + data + CRC
  return offset + 12 + length;
}

// A PNG is whole only when it opens with the signature, its first chunk
// is IHDR, and a walk over its chunks ends exactly at an IEND chunk.
function assertWholePng(bytes: Buffer, label: string): void {
  if (bytes.length < 45) {
    throw new Error(`${label} is too short to be a PNG (${bytes.length} bytes)`);
  }
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`${label} does not start with the PNG signature`);
  }
  if (!bytes.subarray(12, 16).equals(IHDR)) {
    throw new Error(`${label} has no IHDR chunk where a PNG must have one`);
  }
  let offset = 8;
  let lastType = Buffer.alloc(0);
  while (offset + 8 <= bytes.length) {
    lastType = bytes.subarray(offset + 4, offset + 8);
    offset = nextChunk(bytes, offset);
    if (offset > bytes.length) {
      throw new Error(`${label} has a chunk that runs past the end of the file`);
    }
    if (lastType.equals(IEND)) {
      break;
    }
  }
  if (!lastType.equals(IEND) || offset !== bytes.length) {
    throw new Error(`${label} does not end cleanly with an IEND chunk`);
  }
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, SOURCE_NAME);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const target = join(outDir, SOURCE_NAME);

  const bytes = readFileSync(source);
  assertWholePng(bytes, SOURCE_NAME);

  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, target);

  // The copy must be exact: same size and same SHA-256 on both sides.
  const copied = readFileSync(target);
  if (copied.length !== bytes.length) {
    throw new Error(`${SOURCE_NAME} copy has the wrong size`);
  }
  if (sha256Hex(copied) !== sha256Hex(bytes)) {
    throw new Error(`${SOURCE_NAME} copy is not byte-identical`);
  }

  console.log(
    `${SOURCE_NAME}: ${bytes.length} bytes, sha256 ${sha256Hex(bytes)}, written to ${target}`,
  );
}

main();
