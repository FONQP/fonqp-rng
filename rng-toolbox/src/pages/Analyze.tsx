import {
    Button,
    Select,
    TextInput,
    Title,
    Stack,
    Flex,
    Box,
    ScrollArea,
    Paper
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import {
    writeTextFile,
    readTextFile,
    create,
    BaseDirectory,
    mkdir,
    exists
} from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import classes from './Pages.module.css';



export default function Analyze() {
    const [outputDest, setOutputDest] = useState('screen');
    const [filePath, setFilePath] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [outputLines, setOutputLines] = useState<string[]>([]);


    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [outputLines]);

    return (
        <Stack gap="md" style={{ height: '100vh', padding: 20 }}>
            <Title order={2} className={classes.title}>Analyze</Title>
            <Flex gap="md" style={{ flex: 1, overflow: 'hidden' }}>
                <Stack gap="md" style={{ width: '50%', height: '100%', overflow: 'hidden' }}>

                    <Flex gap="md">
                        <Flex gap="sm" align="end">
                            <TextInput
                                label="Load File Path"
                                value={filePath}
                                onChange={(e) => setFilePath(e.currentTarget.value)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                variant="light"
                                onClick={async () => {
                                    try {
                                        const selected = await save({
                                            filters: [{ name: 'Text File', extensions: ['txt', 'csv'] }],
                                            title: 'Load Output File',
                                            defaultPath: 'output.txt',
                                        });
                                        if (selected) setFilePath(selected);
                                    } catch (err) {
                                        console.error('Load dialog failed:', err);
                                    }
                                }}
                                className={classes.button}
                            >
                                Browse
                            </Button>
                        </Flex>
                    </Flex>

                    <Flex gap="md">
                        <Flex gap="sm" align="end">
                            <Select
                                label="Output"
                                data={[
                                    { value: 'screen', label: 'Screen' },
                                    { value: 'file', label: 'File' },
                                    { value: 'none', label: 'None' },
                                ]}
                                value={outputDest}
                                onChange={(val) => setOutputDest(val!)}
                                style={{ flex: 1 }}
                                checkIconPosition='right'
                                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                            />
                        </Flex>
                        {outputDest === 'file' && (
                            <Flex gap="sm" align="end">
                                <TextInput
                                    label="Save File Path"
                                    value={filePath}
                                    onChange={(e) => setFilePath(e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    variant="light"
                                    onClick={async () => {
                                        try {
                                            const selected = await save({
                                                filters: [{ name: 'Text File', extensions: ['txt', 'csv'] }],
                                                title: 'Save Output File',
                                                defaultPath: 'output.txt',
                                            });
                                            if (selected) setFilePath(selected);
                                        } catch (err) {
                                            console.error('Save dialog failed:', err);
                                        }
                                    }}
                                    className={classes.button}
                                >
                                    Browse
                                </Button>
                            </Flex>
                        )}
                    </Flex>

                        <Flex gap="sm" align="end">
                    <Button
                        variant="light"
                        onClick={async () => {
                            try {
                                const selected = await save({
                                    filters: [{ name: 'Text File', extensions: ['txt', 'csv'] }],
                                    title: 'Load Output File',
                                    defaultPath: 'output.txt',
                                });
                                if (selected) setFilePath(selected);
                            } catch (err) {
                                console.error('Load dialog failed:', err);
                            }
                        }}
                        className={classes.button}
                    >
                        NIST STS
                    </Button>
                    </Flex>

                </Stack>

                {outputDest === 'screen' && (
                    <Box flex={1} h="100%" style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
                        <Paper
                            withBorder
                            radius="md"
                            p="md"
                            style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}
                        >
                            <Title order={3} mb="xs" c={'gray'}>
                                Report
                            </Title>

                            <ScrollArea h="100%" scrollbars="y" viewportRef={scrollRef}>
                                <Box component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                                    {outputLines.join('\n')}
                                </Box>
                            </ScrollArea>
                        </Paper>
                    </Box>
                )}
            </Flex>
        </Stack>
    );
}
