import {
  Button,
  Select,
  TextInput,
  Title,
  Stack,
  Flex,
  Box,
  ScrollArea,
  Paper,
  Checkbox,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { invoke, Channel } from '@tauri-apps/api/core';
import {
  writeTextFile,
  BaseDirectory
} from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { ButtonProgress } from '../components/ButtonProgress';
import Conditioners from '../components/Conditioners';
import classes from './Pages.module.css';
import { SETTINGS_FILE, loadSettings } from '../components/Settings';


type CollectEvent =
  | {
    event: 'sample';
    data: {
      line: string;
      percent: number;
    };
  }
  | {
    event: 'finished';
  }
  | {
    event: 'error';
    data: {
      message: string;
    };
  };


export default function Collect() {
  const [usbPorts, setUsbPorts] = useState<{ value: string; label: string }[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [baudRate, setBaudRate] = useState('');
  const [outputDest, setOutputDest] = useState('screen');
  const [numSamples, setNumSamples] = useState('');
  const [filePath, setFilePath] = useState('');
  const [entropyDirect, setEntropyDirect] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [collecting, setCollecting] = useState(false);
  const [percent, setPercent] = useState(0);
  const [remoteFetchAPI, setRemoteFetchAPI] = useState('');
  const [selectedConditioner, setSelectedConditioner] = useState<string | null>('none');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCollectData = async () => {
    setOutputLines([]);
    setPercent(0);
    setCollecting(true);

    const onEvent = new Channel<CollectEvent>();

    const MAX_VISIBLE_LINES = 500;

    onEvent.onmessage = (message) => {
      switch (message.event) {
        case 'sample':
          setOutputLines((prev) => {
            const next = [...prev, message.data.line];
            return next.slice(-MAX_VISIBLE_LINES);
          });
          setPercent(message.data.percent);
          break;
        case 'finished':
          setCollecting(false);
          break;
        case 'error':
          setOutputLines((prev) => {
            const next = [...prev, `Error: ${message.data.message}`];
            return next.slice(-MAX_VISIBLE_LINES);
          });
          break;
        default:
          setOutputLines((prev) => {
            const next = [...prev, '[Unknown Event]'];
            return next.slice(-MAX_VISIBLE_LINES);
          });
      }
    };

    try {
      await invoke('collect_data', {
        port: selectedPort,
        baudRate,
        outputDest,
        numSamples,
        filePath,
        entropyDirect,
        onEvent,
      });
    } catch (err) {
      console.error('Collection failed:', err);
      setOutputLines((prev) => [...prev, `Collection failed: ${String(err)}`]);
    }
  };

  useEffect(() => {
    async function fetchUsbPorts() {
      try {
        const ports = await invoke<string[]>('list_usb_ports');
        const portOptions = ports.map((port) => ({ value: port, label: port }));
        setUsbPorts(portOptions);
      } catch (error) {
        console.error('Failed to fetch USB ports:', error);
      }
    }
    fetchUsbPorts();

    async function initSettings() {
      const settings = await loadSettings();
      if (settings.port) setSelectedPort(settings.port);
      if (settings.baudRate) setBaudRate(settings.baudRate);
      if (settings.outputDest) setOutputDest(settings.outputDest);
      if (settings.numSamples) setNumSamples(settings.numSamples);
    }
    initSettings();
  }, []);

  useEffect(() => {
    async function saveSettings() {
      const settings = { port: selectedPort, baudRate, outputDest, numSamples };
      try {
        await writeTextFile(SETTINGS_FILE, JSON.stringify(settings), {
          baseDir: BaseDirectory.AppConfig,
        });
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }
    saveSettings();
  }, [selectedPort, baudRate, outputDest, numSamples]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [outputLines]);

  const [conditioners, setConditioners] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchConditioners() {
      try {
        const result = await invoke<{ value: string; label: string }[]>('list_conditioners');
        setConditioners(result);
      } catch (err) {
        console.error('Failed to fetch conditioners:', err);
      }
    }
    fetchConditioners();
  }, []);

  return (
    <Stack gap="md" style={{ height: '100vh', padding: 20 }}>
      <Title order={2} className={classes.title}>Collect Data</Title>
      <Flex gap="md" style={{ flex: 1, overflow: 'hidden' }}>
        <Stack gap="md" style={{ width: '50%', height: '100%', overflow: 'hidden' }}>

          <Flex gap="md">
            <Select
              label="Source Port"
              placeholder="Select a port"
              data={usbPorts}
              value={selectedPort}
              onChange={setSelectedPort}
              required
              style={{ flex: 1 }}
              checkIconPosition='right'
              comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
            />

            <TextInput
              label="Baud Rate"
              placeholder="e.g., 9600"
              value={baudRate}
              onChange={(e) => setBaudRate(e.currentTarget.value)}
              style={{ flex: 1 }}
            />

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

          <Flex gap="md">
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
                >
                  Browse
                </Button>
              </Flex>
            )}

            <TextInput
              label="Samples"
              placeholder="e.g., 1000"
              value={numSamples}
              onChange={(e) => setNumSamples(e.currentTarget.value)}
              required
              style={{ alignSelf: 'flex-start' }}
            />
          </Flex>

          {numSamples === '*' && (
            <Checkbox
              label="Pipe to OS Entropy Pool"
              checked={entropyDirect}
              onChange={(e) => setEntropyDirect(e.currentTarget.checked)}
            />
          )}

          <Flex gap="md">
            <TextInput
              label="Remote Fetch API"
              placeholder="e.g., fonqp.iitkgp.ac.in/services/rng/fetch"
              value={remoteFetchAPI}
              onChange={(e) => setRemoteFetchAPI(e.currentTarget.value)}
              style={{ alignSelf: 'flex-start', minWidth: '32%' }}
            />
          </Flex>

          <Flex gap="md">
            <Select
              label="Conditioning"
              placeholder="Select a conditioner"
              data={conditioners}
              value={selectedConditioner}
              onChange={setSelectedConditioner}
              style={{ alignSelf: 'flex-start' }}
              checkIconPosition='right'
              comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
            />

            {selectedConditioner && selectedConditioner !== 'none' && (
              <Conditioners />
            )}
          </Flex>

          <ButtonProgress
            onCollect={handleCollectData}
            collecting={collecting}
            percent={percent}
            className={classes.button}
          />
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
                Output Stream
              </Title>

              <ScrollArea h="100%" scrollbars="y" viewportRef={scrollRef}>
                <Box component="pre" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {outputLines.join('')}
                </Box>
              </ScrollArea>
            </Paper>
          </Box>
        )}
      </Flex>
    </Stack>
  );
}
