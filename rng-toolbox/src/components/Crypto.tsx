import { Box, Textarea, Stack, Select, TextInput, Button, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Crypto({ settings }: { settings: any }) {
    const [algorithms, setAlgorithms] = useState<string[]>([]);

    useEffect(() => {
        const fetchAlgorithms = async () => {
            const algs = await invoke<string[]>('list_crypto_algorithms');
            setAlgorithms(algs);
        };

        fetchAlgorithms();
    }, []);

    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

    const [key, setKey] = useState<string>('');
    const gen_key = async () => {
        if (!selectedAlgorithm) {
            console.error('No algorithm selected');
            return;
        }
        try {
            const generatedKey = await invoke<string>('gen_key', { algorithm: selectedAlgorithm, port: settings.port, baudRate: settings.baudRate });
            setKey(generatedKey);
        } catch (err) {
            console.error('Key generation failed:', err);
        }
    }

    const [plaintext, setPlaintext] = useState<string>('');
    const [ciphertext, setCiphertext] = useState<string>('');

    const crypt = async () => {
        if (!selectedAlgorithm) {
            console.error('No algorithm selected');
            return;
        }
        if (!key) {
            console.error('No key provided');
            return;
        }

        try {
            if (!plaintext && ciphertext) {
                const result = await invoke<string>('crypt', {
                    algorithm: selectedAlgorithm,
                    key,
                    msg: ciphertext,
                    enc: false,
                });
                setPlaintext(result);
            } else if (!ciphertext && plaintext) {
                const result = await invoke<string>('crypt', {
                    algorithm: selectedAlgorithm,
                    key,
                    msg: plaintext,
                    enc: true,
                });
                setCiphertext(result);
            } else {
                console.warn('Provide either plaintext or ciphertext (not both)');
            }
        } catch (err) {
            console.error('Cryptographic operation failed:', err);
        }
    };


    return (
        <>
            <Box
                style={{
                    flex: 1,
                    display: 'flex',
                    padding: 16,
                }}
            >
                <Textarea
                    placeholder="Plaintext"
                    radius="md"
                    autosize={false}
                    resize="none"
                    style={{
                        flex: 1,
                    }}
                    styles={{
                        wrapper: { height: '100%' },
                        input: { height: '100%' },
                    }}
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.currentTarget.value)}
                />
            </Box>

            <Box
                style={{
                    overflow: 'auto',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 8,
                }}
            >

                <Stack gap="md" w={rem(300)}>
                    <Select
                        label="Algorithm"
                        placeholder="Select an algorithm"
                        data={algorithms.map((alg) => ({ value: alg, label: alg }))}
                        value={selectedAlgorithm}
                        onChange={(val) => setSelectedAlgorithm(val!)}
                        required
                        style={{ flex: 1 }}
                        checkIconPosition='right'
                        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                    />

                    <TextInput
                        label="Key"
                        value={key}
                        required
                    />

                    <Button
                        variant="light"
                        onClick={gen_key}
                    >
                        gen_key
                    </Button>

                    <Button
                        variant="light"
                        onClick={crypt}
                    >
                        [En/De]crypt
                    </Button>
                </Stack>
            </Box>

            <Box
                style={{
                    flex: 1,
                    display: 'flex',
                    padding: 16,
                }}
            >
                <Textarea
                    placeholder="Ciphertext"
                    radius="md"
                    autosize={false}
                    resize="none"
                    style={{
                        flex: 1,
                    }}
                    styles={{
                        wrapper: { height: '100%' },
                        input: { height: '100%' },
                    }}
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.currentTarget.value)}
                />
            </Box>
        </>
    );
}
