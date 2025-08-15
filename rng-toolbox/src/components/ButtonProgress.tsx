// components/ButtonProgress.tsx
import { Button, Progress, rgba, useMantineTheme } from '@mantine/core';
import classes from './ButtonProgress.module.css';

interface ButtonProgressProps {
  onCollect: () => void;
  collecting: boolean;
  percent: number;
  className?: string;
}

export function ButtonProgress({
  onCollect,
  collecting,
  percent,
  className,
}: ButtonProgressProps) {
  const theme = useMantineTheme();

  return (
    <Button
      className={`${classes.button} ${className}`}
      style={{ minWidth: 190, alignSelf: 'flex-start' }}
      onClick={onCollect}
      color={!collecting && percent === 100 ? 'teal' : theme.primaryColor}
      radius="md"
      disabled={collecting && percent >= 100}
    >
      <div className={classes.label}>
        {collecting
          ? `Collecting... (${percent}%)`
          : 'Start Collect'}
      </div>

      {collecting && (
        <Progress
          value={percent}
          className={classes.progress}
          color={rgba(theme.colors.blue[2], 0.35)}
          radius="sm"
        />
      )}
    </Button>
  );
}
