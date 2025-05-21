export type Database = { name: string, version: number; init: (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => void }

export function get<T>(db: Database, store: string, key: IDBValidKey | IDBKeyRange) {
    const conn = window.indexedDB.open(db.name, db.version);
    conn.onupgradeneeded = db.init;
    return new Promise<T | undefined>(resolve => {
        conn.onsuccess = e => {
            const db = (e.target as IDBOpenDBRequest).result;
            const tr = db.transaction(store, 'readonly');
            const tbl = tr.objectStore(store);
            tbl.get(key).onsuccess = e => {
                const val = (e.target as IDBRequest).result;
                resolve(val);
            }
        }
    });
}

export function put<Key extends IDBValidKey>(db: Database, store: string, value: any, key?: Key) : Promise<Key>{
    const conn = window.indexedDB.open(db.name, db.version);
    conn.onupgradeneeded = db.init;
    return new Promise<Key>(resolve => {
        conn.onsuccess = e => {
            const db = (e.target as IDBOpenDBRequest).result;
            const tr = db.transaction(store, 'readwrite');
            const tbl = tr.objectStore(store);
            tbl.put(value, key).onsuccess = e => {
                const val = (e.target as IDBRequest).result;
                resolve(val);
            }
        }
    });
}

export function remove(db: Database, store: string, key: IDBValidKey) : Promise<void>{
    const conn = window.indexedDB.open(db.name, db.version);
    conn.onupgradeneeded = db.init;
    return new Promise(resolve => {
        conn.onsuccess = e => {
            const db = (e.target as IDBOpenDBRequest).result;
            const tr = db.transaction(store, 'readwrite');
            const tbl = tr.objectStore(store);
            tbl.delete(key).onsuccess = resolve as any;
        }
    });
}