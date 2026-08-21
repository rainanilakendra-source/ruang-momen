export const UPLOAD_QUEUE_DB_NAME = "ruang-momen-upload-queue";
export const UPLOAD_QUEUE_STORE = "uploads";

export type UploadQueueStatus = "queued" | "uploading" | "failed";

export type UploadQueueItem = {
  id: string;
  eventSlug: string;
  file: Blob;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  guestName: string | null;
  source: string | null;
  createdAt: string;
  attempts: number;
  status: UploadQueueStatus;
  nextAttemptAt: number;
  errorMessage: string | null;
};

function openQueueDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(UPLOAD_QUEUE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(UPLOAD_QUEUE_STORE)) {
        const store = database.createObjectStore(UPLOAD_QUEUE_STORE, { keyPath: "id" });
        store.createIndex("eventSlug", "eventSlug", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB tidak tersedia."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Antrean tidak dapat diperbarui."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Antrean tidak dapat diperbarui."));
  });
}

export async function addUploadQueueItems(items: UploadQueueItem[]): Promise<void> {
  if (!items.length) return;
  const database = await openQueueDatabase();
  try {
    const transaction = database.transaction(UPLOAD_QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(UPLOAD_QUEUE_STORE);
    items.forEach((item) => store.add(item));
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

export async function getEventUploadQueue(eventSlug: string): Promise<UploadQueueItem[]> {
  const database = await openQueueDatabase();
  try {
    const transaction = database.transaction(UPLOAD_QUEUE_STORE, "readonly");
    const request = transaction.objectStore(UPLOAD_QUEUE_STORE).index("eventSlug").getAll(eventSlug);
    const items = await new Promise<UploadQueueItem[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as UploadQueueItem[]);
      request.onerror = () => reject(request.error ?? new Error("Antrean tidak dapat dibaca."));
    });
    return items.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  } finally {
    database.close();
  }
}

export async function putUploadQueueItem(item: UploadQueueItem): Promise<void> {
  const database = await openQueueDatabase();
  try {
    const transaction = database.transaction(UPLOAD_QUEUE_STORE, "readwrite");
    transaction.objectStore(UPLOAD_QUEUE_STORE).put(item);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

export async function deleteUploadQueueItem(id: string): Promise<void> {
  const database = await openQueueDatabase();
  try {
    const transaction = database.transaction(UPLOAD_QUEUE_STORE, "readwrite");
    transaction.objectStore(UPLOAD_QUEUE_STORE).delete(id);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}
