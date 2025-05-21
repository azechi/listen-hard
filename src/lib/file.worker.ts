
//console.log("test");

onmessage = ({data:[name, port]}: {data: [string, MessagePort]}) => {
    void writeFile(name, port);
}

async function writeFile(name: string, port: MessagePort) {
    const root = await navigator.storage.getDirectory();
    const hndl = await root.getFileHandle(name, { create: true })
        .then(h => h.createSyncAccessHandle());

    let pos = 0;
    port.onmessage = ({data}) => {
        if (data == 'EOF') {
            hndl.close();
        } else {
            // iOS 15.8.4では writeメソッドの二番目の引数(FileSystemReadWriteOptions)は必須です！！
            pos += hndl.write(data, {at: pos});
        }
    };

}
