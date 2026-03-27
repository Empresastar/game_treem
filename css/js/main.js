window.onload = async () => {
    let isRemoteUpdate = false;
    let previewTimeout;

    // Inicializa o Monaco Editor
    await EditorModule.init('monaco-editor').catch(() => console.error("Erro Editor"));

    // Lógica de Atualização do Preview e Console
    const updatePreview = () => {
        const iframe = document.getElementById('preview-iframe');
        const code = EditorModule.instance.getValue();
        const consoleEl = document.getElementById('fake-console');
        consoleEl.innerHTML = ""; 

        // Injeta script para capturar logs do iframe e mandar para o App principal
        const consoleScript = `
            <script>
                const _log = console.log;
                console.log = function(...args) {
                    window.parent.postMessage({ type: 'LOG', content: args.join(' ') }, '*');
                    _log.apply(console, args);
                };
                window.onerror = function(msg) {
                    window.parent.postMessage({ type: 'LOG', content: 'ERRO: ' + msg }, '*');
                };
            <\/script>
        `;

        const blob = new Blob([consoleScript + code], { type: 'text/html' });
        iframe.src = URL.createObjectURL(blob);
    };

    // Escuta as mensagens de LOG vindas do iframe
    window.addEventListener('message', (event) => {
        if (event.data.type === 'LOG') {
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerText = `> ${event.data.content}`;
            document.getElementById('fake-console').appendChild(div);
        }
    });

    const handleData = (data) => {
        if (data.type === 'FOLDER_SYNC') {
            FilesModule.renderFileList(data.files);
        }

        if (data.type === 'SYNC' || data.type === 'FILE') {
            isRemoteUpdate = true;
            if (data.type === 'FILE') {
                EditorModule.setLanguage(data.name);
                document.getElementById('active-filename').innerText = data.name;
            }
            const pos = EditorModule.instance.getPosition();
            EditorModule.instance.setValue(data.content);
            EditorModule.instance.setPosition(pos);
            updatePreview();
            setTimeout(() => { isRemoteUpdate = false; }, 50);
        }
    };

    P2PModule.init(handleData);

    // Eventos de Interface
    document.getElementById('open-folder-btn').onclick = () => FilesModule.openFolder();
    document.getElementById('create-file-btn').onclick = () => FilesModule.createFile();
    document.getElementById('connect-btn').onclick = () => {
        const id = document.getElementById('peer-id-input').value;
        if(id) P2PModule.connect(id, handleData);
    };

    // Sincronização P2P e Auto-Preview ao digitar
    EditorModule.instance.onDidChangeModelContent(() => {
        if (!isRemoteUpdate) {
            P2PModule.send({ type: 'SYNC', content: EditorModule.instance.getValue() });
        }
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(updatePreview, 800); // Atualiza após 0.8s de pausa
    });
};
