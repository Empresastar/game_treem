const EditorModule = {
    instance: null,
    init(idDiv) {
        return new Promise((resolve, reject) => {
            const container = document.getElementById(idDiv);
            if (!container) {
                console.error(`Erro crítico: Div #${idDiv} não encontrada.`);
                return reject();
            }

            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' }});
            require(['vs/editor/editor.main'], () => {
                try {
                    this.instance = monaco.editor.create(container, {
                        theme: 'vs-dark',
                        automaticLayout: true,
                        fontSize: 14,
                        language: 'javascript',
                        minimap: { enabled: false }
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    },
    setLanguage(filename) {
        if (!this.instance) return;
        const ext = filename.split('.').pop().toLowerCase();
        const map = { 'html': 'html', 'css': 'css', 'js': 'javascript', 'py': 'python', 'json': 'json' };
        monaco.editor.setModelLanguage(this.instance.getModel(), map[ext] || 'plaintext');
    }
};
