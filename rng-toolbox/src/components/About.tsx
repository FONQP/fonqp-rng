import { Modal, Text, Title, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { version } from '../../package.json';

export default function About({ opened, onClose }: { opened: boolean; onClose: () => void }) {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();

    const primaryColor = colorScheme === 'dark' ? theme.colors.gray[2] : theme.colors.gray[7];
    const secondaryColor = colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[6];

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="About"
            size="xl"
            centered
            withCloseButton={false}
            padding="xl"
            radius="md"
            transitionProps={{
                transition: 'pop',
                duration: 600,
                timingFunction: 'ease',
            }}
        >
            <Title order={2} c={primaryColor}>
                RNG Toolbox
            </Title>

            <Text c="dimmed" mt="sm">
                Collection of tools to interface with Hardware Random Number Generators (HRNGs)
            </Text>

            <br />

            <Text c={primaryColor}>
                Developed by
                <br />
                Fiber Optics, Nano and Quantum Photonics (FONQP) Group
                <br />
                Indian Institute of Technology Kharagpur
            </Text>

            <br />

            <Text c={primaryColor}>
                For more information, visit the{' '}
                <a href="https://fonqp.iitkgp.ac.in/services/rng/">
                    RNG Toolbox documentation
                </a>
            </Text>

            <Text c={secondaryColor} mt="md">
                Version: {version}
            </Text>
        </Modal>
    );
}
