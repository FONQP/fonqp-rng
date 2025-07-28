import { useState } from 'react';
import {
    Button,
    NumberInput,
    Stack,
    Title,
    Flex,
    Text,
    Center,
    rem,
} from '@mantine/core';
import { motion } from 'framer-motion';

export default function Applications() {
    // Coin Flip States
    const [flipping, setFlipping] = useState(false);
    const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | null>(null);

    // Random Number Generator States
    const [start, setStart] = useState<number | undefined>(undefined);
    const [end, setEnd] = useState<number | undefined>(undefined);
    const [base, setBase] = useState<number>(10);
    const [randomNumber, setRandomNumber] = useState<string | null>(null);

    // Coin flip logic
    const flipCoin = () => {
        setFlipping(true);
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        setTimeout(() => {
            setFlipping(false);
            setCoinResult(result);
        }, 1500); // Animation duration
    };

    // Random number generator logic
    const generateRandomNumber = () => {
        if (typeof start !== 'number' || typeof end !== 'number' || start >= end) {
            setRandomNumber('Invalid input');
            return;
        }

        const value = Math.floor(Math.random() * (end - start + 1)) + start;
        const formatted = value.toString(base);
        setRandomNumber(`Base-${base}: ${formatted}`);
    };

    return (
        <Flex justify="center" gap="xl" align="start" p="xl" wrap="wrap">
            {/* Coin Flip Section */}
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
                {coinResult && (
                    <Text size="lg" fw={500}>
                        Result: {coinResult}
                    </Text>
                )}
                <Button onClick={flipCoin}>Flip Coin</Button>
            </Stack>

            {/* Random Number Generator Section */}
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

                <Button onClick={generateRandomNumber}>Generate</Button>
                {randomNumber && (
                    <Text size="lg" fw={500}>
                        {randomNumber}
                    </Text>
                )}
            </Stack>
        </Flex>
    );
}
