import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSkeleton } from './loading-skeleton';

const meta = {
  title: 'UI/LoadingSkeleton',
  component: LoadingSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    lines: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of skeleton lines to display',
    },
    message: {
      control: 'text',
      description: 'Optional loading message',
    },
  },
} satisfies Meta<typeof LoadingSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const FewLines: Story = {
  args: {
    lines: 2,
  },
};

export const ManyLines: Story = {
  args: {
    lines: 7,
  },
};

export const WithMessage: Story = {
  args: {
    lines: 4,
    message: 'Loading content...',
  },
};

export const InCard: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Article
        </h3>
      </div>
      <div className="p-6 pt-0">
        <LoadingSkeleton lines={5} />
      </div>
    </div>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
          </div>
          <div className="p-6 pt-0">
            <LoadingSkeleton lines={3} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const ProfileSkeleton: Story = {
  render: () => (
    <div className="w-[350px] space-y-4 p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <LoadingSkeleton lines={4} />
    </div>
  ),
};
