import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './loading-spinner';

const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
    },
    message: {
      control: 'text',
      description: 'Optional loading message',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithMessage: Story = {
  args: {
    message: 'Loading data...',
  },
};

export const LargeWithMessage: Story = {
  args: {
    size: 'lg',
    message: 'Fetching weather information...',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <LoadingSpinner size="sm" message="Small" />
      <LoadingSpinner size="md" message="Medium" />
      <LoadingSpinner size="lg" message="Large" />
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Weather Data
        </h3>
      </div>
      <div className="p-6 pt-0">
        <LoadingSpinner message="Loading weather data..." />
      </div>
    </div>
  ),
};
