import { Stepper, Box } from "@mantine/core";
import { IconUser, IconLink, IconDashboard, IconCheck } from "@tabler/icons-react";

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

const stepIcons = [
  <IconUser size={18} />,
  <IconLink size={18} />,
  <IconDashboard size={18} />,
];

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <Box mb="xl">
      <Stepper
        active={currentStep - 1}
        color="dark"
        completedIcon={<IconCheck size={18} />}
        size="md"
        styles={{
          step: {
            '&[data-completed]': {
              backgroundColor: '#51cf66',
              borderColor: '#51cf66',
            },
            '&[data-progress]': {
              backgroundColor: '#000000',
              borderColor: '#000000',
            },
          },
          stepIcon: {
            '&[data-completed]': {
              backgroundColor: '#51cf66',
              borderColor: '#51cf66',
              color: '#ffffff',
            },
            '&[data-progress]': {
              backgroundColor: '#000000',
              borderColor: '#000000',
              color: '#ffffff',
            },
          },
          stepLabel: {
            fontWeight: 500,
            fontSize: '14px',
          },
          separator: {
            '&[data-active]': {
              backgroundColor: '#51cf66',
            },
          },
        }}
      >
        {steps.map((step, index) => (
          <Stepper.Step
            key={index}
            label={step}
            icon={stepIcons[index]}
          />
        ))}
      </Stepper>
    </Box>
  );
}