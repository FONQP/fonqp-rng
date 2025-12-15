import {
    readTextFile,
    create,
    BaseDirectory,
    mkdir,
    exists
} from '@tauri-apps/plugin-fs';

export const SETTINGS_FILE = 'collect_settings.json';

async function ensureAppConfigDir() {
    try {
        const existsFlag = await exists('', { baseDir: BaseDirectory.AppConfig });
        if (!existsFlag) {
            await mkdir('', { baseDir: BaseDirectory.AppConfig, recursive: true });
        }
    } catch (mkdirErr) {
        console.error('Failed to ensure AppConfig directory exists:', mkdirErr);
    }
}

export async function loadSettings() {
    try {
        const contents = await readTextFile(SETTINGS_FILE, {
            baseDir: BaseDirectory.AppConfig,
        });
        return JSON.parse(contents);
    } catch (err) {
        try {
            await ensureAppConfigDir();
            const defaultSettings = {
                port: null,
                baudRate: '',
                outputDest: 'screen',
                numSamples: '',
            };
            const file = await create(SETTINGS_FILE, {
                baseDir: BaseDirectory.AppConfig,
            });
            await file.write(new TextEncoder().encode(JSON.stringify(defaultSettings)));
            await file.close();
        } catch (createErr) {
            console.error('Failed to create settings file:', createErr);
        }
    }
}