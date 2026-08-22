const encoder = new TextEncoder();

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

export type ZipEntry = {
  name: string;
  modifiedAt: Date;
  load: () => Promise<Uint8Array | null>;
};

type CentralEntry = {
  name: Uint8Array;
  crc: number;
  size: number;
  time: number;
  date: number;
  offset: number;
};

function header(size: number, write: (view: DataView) => void): Uint8Array {
  const bytes = new Uint8Array(size);
  write(new DataView(bytes.buffer));
  return bytes;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(value: Date): { date: number; time: number } {
  const year = Math.max(1980, Math.min(2107, value.getFullYear()));
  return {
    date: ((year - 1980) << 9) | ((value.getMonth() + 1) << 5) | value.getDate(),
    time: (value.getHours() << 11) | (value.getMinutes() << 5) | Math.floor(value.getSeconds() / 2),
  };
}

async function* zipChunks(entries: ZipEntry[]): AsyncGenerator<Uint8Array> {
  const centralEntries: CentralEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const bytes = await entry.load();
    if (!bytes) continue;

    const name = encoder.encode(entry.name);
    const crc = crc32(bytes);
    const { date, time } = dosDateTime(entry.modifiedAt);
    const localOffset = offset;
    const localHeader = header(30, (view) => {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0x0808, true); // UTF-8 name and trailing data descriptor.
      view.setUint16(8, 0, true); // Store originals without recompressing them.
      view.setUint16(10, time, true);
      view.setUint16(12, date, true);
      view.setUint16(26, name.length, true);
    });

    yield localHeader;
    yield name;
    yield bytes;

    const descriptor = header(16, (view) => {
      view.setUint32(0, 0x08074b50, true);
      view.setUint32(4, crc, true);
      view.setUint32(8, bytes.length, true);
      view.setUint32(12, bytes.length, true);
    });
    yield descriptor;

    centralEntries.push({ name, crc, size: bytes.length, time, date, offset: localOffset });
    offset += localHeader.length + name.length + bytes.length + descriptor.length;
  }

  const centralOffset = offset;
  for (const entry of centralEntries) {
    const centralHeader = header(46, (view) => {
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0x0808, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, entry.time, true);
      view.setUint16(14, entry.date, true);
      view.setUint32(16, entry.crc, true);
      view.setUint32(20, entry.size, true);
      view.setUint32(24, entry.size, true);
      view.setUint16(28, entry.name.length, true);
      view.setUint32(42, entry.offset, true);
    });
    yield centralHeader;
    yield entry.name;
    offset += centralHeader.length + entry.name.length;
  }

  const centralSize = offset - centralOffset;
  yield header(22, (view) => {
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, centralEntries.length, true);
    view.setUint16(10, centralEntries.length, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralOffset, true);
  });
}

export function createZipStream(entries: ZipEntry[]): ReadableStream<Uint8Array> {
  const iterator = zipChunks(entries);
  return new ReadableStream({
    async pull(controller) {
      try {
        const result = await iterator.next();
        if (result.done) controller.close();
        else controller.enqueue(result.value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return(undefined);
    },
  });
}
