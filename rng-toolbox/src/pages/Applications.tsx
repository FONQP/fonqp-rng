import { ReactNode, useState, useEffect } from 'react';
import {
    Button,
    NumberInput,
    Stack,
    Title,
    Text,
    rem,
    SimpleGrid,
    Box,
} from '@mantine/core';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import classes from './Pages.module.css';
import { loadSettings } from '../components/Settings';
import Crypto from '../components/Crypto';

export default function Applications() {
    // Load settings
    const [settings, setSettings] = useState<any>(null);
    useEffect(() => {
        async function fetchSettings() {
            const s = await loadSettings();
            setSettings(s);
        }
        fetchSettings();
    }, []);

    // Coin Flip States
    const [flipping, setFlipping] = useState(false);
    const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | null>(null);

    // Random Number Generator States
    const [start, setStart] = useState<number | undefined>(undefined);
    const [end, setEnd] = useState<number | undefined>(undefined);
    const [base, setBase] = useState<number>(10);
    const [randomNumber, setRandomNumber] = useState<ReactNode>(null);

    // OTP generation States
    const [otpLength, setOtpLength] = useState<number>(6);
    const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

    // Coin flip logic
    const flipCoin = async () => {
        setFlipping(true);
        const result = await invoke<number>('generate_random_number', { start: 0, end: 2, port: settings.port, baudRate: settings.baudRate });
        const coinSide = result % 2 === 0 ? 'Heads' : 'Tails';
        setTimeout(() => {
            setFlipping(false);
            setCoinResult(coinSide);
        }, 1500); // Animation duration
    };

    // Random number generator logic
    const generateRandomNumber = async () => {
        if (typeof start !== 'number' || typeof end !== 'number' || start >= end) {
            setRandomNumber('Invalid input');
            return;
        }

        const value = await invoke<number>('generate_random_number', { start, end, port: settings.port, baudRate: settings.baudRate });
        const formatted = value.toString(base);
        setRandomNumber(
            <>
                ({formatted})<sub>{base}</sub>
            </>
        );
    };

    // OTP generation logic
    const generateOtp = async () => {
        let otp = '';
        for (let i = 0; i < otpLength; i++) {
            const digit = await invoke<number>('generate_random_number', { start: 0, end: 10, port: settings.port, baudRate: settings.baudRate });
            otp += digit.toString();
        }
        setGeneratedOtp(otp);
    };

    return (
        <Stack gap="md" style={{ height: '100vh', padding: 20 }}>
            <Title order={2} className={classes.title}>Applications</Title>
            <SimpleGrid
                cols={3}
                spacing="md"
                style={{ flex: 1, overflow: 'hidden', minHeight: 0, gridTemplateRows: '40% 60%' }}
            >
                <Box
                    style={{
                        overflow: 'auto',
                        minHeight: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'start',
                    }}
                >
                    <Stack align="center" gap="md">
                        <Title order={2}>Coin Flip</Title>
                        <motion.div
                            animate={{ rotateY: flipping ? 360 * 3 : 0 }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                            style={{
                                width: rem(100),
                                height: rem(100),
                                borderRadius: '50%',
                                background: 'radial-gradient(circle at center, gold 60%, orange 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: rem(30),
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                                backfaceVisibility: 'hidden',
                                perspective: '1000px',
                            }}
                        >
                            🪙
                        </motion.div>
                        <Button onClick={flipCoin} className={classes.button}>
                            {flipping ? 'Flipping...' : 'Flip Coin'}
                        </Button>
                        {coinResult && (
                            <Text size="xl" fw={800} c="gray">
                                {coinResult}
                            </Text>
                        )}
                    </Stack>
                </Box>

                <Box
                    style={{
                        overflow: 'auto',
                        minHeight: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'start',
                    }}
                >
                    <Stack gap="md" w={rem(300)}>
                        <Title order={2}>Random Number</Title>
                        <NumberInput
                            label="Start"
                            placeholder="e.g., 1"
                            value={start}
                            onChange={(val) => setStart(typeof val === 'number' ? val : undefined)}
                        />

                        <NumberInput
                            label="End"
                            placeholder="e.g., 100"
                            value={end}
                            onChange={(val) => setEnd(typeof val === 'number' ? val : undefined)}
                        />

                        <NumberInput
                            label="Base"
                            placeholder="e.g., 10"
                            value={base}
                            min={2}
                            max={36}
                            onChange={(val) => setBase(typeof val === 'number' ? val : 10)}
                        />

                        <Button onClick={generateRandomNumber} className={classes.button}>
                            Generate
                        </Button>
                        {randomNumber && (
                            <Text size="xl" fw={800} c="gray">
                                {randomNumber}
                            </Text>
                        )}
                    </Stack>
                </Box>

                <Box
                    style={{
                        overflow: 'auto',
                        minHeight: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'start',
                    }}
                >
                    <Stack gap="md" w={rem(300)}>
                        <Title order={2}>OTP Generation</Title>
                        <NumberInput
                            label="OTP Length"
                            placeholder="e.g., 6"
                            value={otpLength}
                            min={4}
                            max={30}
                            onChange={(val) => setOtpLength(typeof val === 'number' ? val : 6)}
                        />
                        <Button onClick={generateOtp} className={classes.button}>
                            Generate OTP
                        </Button>
                        {generatedOtp && (
                            <Text size="xl" fw={800} c="gray">
                                Generated OTP: {generatedOtp}
                            </Text>
                        )}
                    </Stack>
                </Box>

                <Box
                    style={{
                        gridColumn: '1 / span 3',   // span across all 3 columns
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflow: 'hidden',
                    }}
                >
                    <Title order={2} style={{ textAlign: 'center', marginBottom: 12 }}>
                        Cryptography
                    </Title>
                    <Box
                        style={{
                            display: 'flex',
                            flex: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Crypto settings={settings} />
                    </Box>
                </Box>


            </SimpleGrid>
        </Stack>
    );
}
