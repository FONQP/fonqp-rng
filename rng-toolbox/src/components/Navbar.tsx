import { useDisclosure } from '@mantine/hooks';
import {
    IconHome,
    IconInfoHexagon,
    IconSocial,
    IconFlask2Filled,
    IconQrcode
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import classes from './NavbarMinimal.module.css';
import ThemeButton from './ThemeButton';
import About from './About';

interface NavbarLinkProps {
    icon: typeof IconHome;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
    return (
        <Tooltip label={label} position="right" transitionProps={{ duration: 0 }} className={classes.tooltip}>
            <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
                <Icon size={25} stroke={1.5} />
            </UnstyledButton>
        </Tooltip>
    );
}

const mockdata = [
    // { icon: IconHome, label: 'Home' },
    { icon: IconSocial, label: 'Collect' },
    { icon: IconFlask2Filled, label: 'Analyze' },
    { icon: IconQrcode, label: 'Applications' }
];

export default function Navbar({ activeIndex, onSectionChange }: { activeIndex: number; onSectionChange: (index: number) => void }) {

    const links = mockdata.map((link, index) => (
        <NavbarLink
            {...link}
            key={link.label}
            active={index === activeIndex}
            onClick={() => onSectionChange(index)}
        />
    ));

    const [opened, { open, close }] = useDisclosure(false);
    const { colorScheme } = useMantineColorScheme();

    const logoSrc = colorScheme === 'dark'
        ? '/rng-logo-dark.png'   // processed image from Python script
        : '/rng-logo.png';

    return (
        <nav className={classes.navbar}>
            <Center>
                <img src={logoSrc} alt="Logo" style={{ height: 30, width: "auto" }} />
            </Center>


            <div className={classes.navbarMain}>
                <Stack justify="center" gap={10}>
                    {links}
                </Stack>
            </div>

            <Stack justify="center" gap={10}>
                <ThemeButton />
                <NavbarLink icon={IconInfoHexagon} label="About" onClick={open} />
                <About opened={opened} onClose={close} />
            </Stack>
        </nav>

    );
}