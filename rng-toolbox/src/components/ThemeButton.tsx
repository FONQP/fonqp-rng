import {
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import classes from './ActionToggle.module.css';

export default function ActionToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <Tooltip label="Toggle theme" position="right" transitionProps={{ duration: 0 }} className={classes.tooltip}>
      <UnstyledButton
        onClick={() => setColorScheme(computed === 'light' ? 'dark' : 'light')}
        className={classes.link}
        aria-label="Toggle color scheme"
      >
        <IconSun className={`${classes.icon} ${classes.light}`} stroke={1.5} size={25} />
        <IconMoon className={`${classes.icon} ${classes.dark}`} stroke={1.5} size={25} />
      </UnstyledButton>
    </Tooltip>
  );
}
