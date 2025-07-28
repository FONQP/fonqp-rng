import { Modal, Stack } from '@mantine/core';

export default function About({ opened, onClose }: { opened: boolean; onClose: () => void }) {
    return (
        <Modal opened={opened} onClose={onClose} title="About" centered withCloseButton={false} radius={"md"} transitionProps={{
            transition: 'pop',
            duration: 600,
            timingFunction: 'ease',
        }}>
            <Stack>
                <h2>RNG Toolbox</h2>
                <p>This is a simple RNG Toolbox application built with React and Mantine.</p>
                <p>It provides a set of tools for collecting, analyzing, and applying random number generation techniques.</p>
                <p>For more information, visit the <a href="https://example.com">documentation</a>.</p>
            </Stack>
        </Modal>
    );
}