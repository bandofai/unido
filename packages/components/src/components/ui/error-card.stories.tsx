import type { Meta, StoryObj } from '@storybook/react';
import { ErrorCard } from './error-card';

const fn = () => () => console.log('Retry clicked');

const meta = {
  title: 'UI/ErrorCard',
  component: ErrorCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Error title',
    },
    message: {
      control: 'text',
      description: 'Error message (required)',
    },
    code: {
      control: 'text',
      description: 'Error code (optional)',
    },
    details: {
      control: 'text',
      description: 'Additional error details (optional)',
    },
    onRetry: {
      description: 'Retry callback (optional)',
    },
  },
  args: {
    onRetry: fn(),
  },
} satisfies Meta<typeof ErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'An error occurred while processing your request.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Network Error',
    message: 'Could not connect to the server. Please check your internet connection.',
  },
};

export const WithCode: Story = {
  args: {
    title: 'Request Failed',
    message: 'The server returned an error.',
    code: 'ERR_500',
  },
};

export const WithRetry: Story = {
  args: {
    title: 'Failed to Load Data',
    message: 'Unable to fetch weather information.',
    code: 'ERR_WEATHER_API',
    onRetry: fn(),
  },
};

export const WithDetails: Story = {
  args: {
    title: 'API Error',
    message: 'Failed to fetch data from the API.',
    code: 'ERR_API_500',
    details: `Error: Internal Server Error
Status: 500
URL: https://api.example.com/data
Timestamp: 2024-01-15T10:30:00Z`,
  },
};

export const Complete: Story = {
  args: {
    title: 'Weather API Error',
    message: 'Unable to retrieve weather data for the requested location.',
    code: 'ERR_WEATHER_404',
    onRetry: fn(),
    details: `Request Details:
- URL: https://api.weather.com/v1/location/london
- Method: GET
- Status: 404
- Error: Location not found
- Timestamp: 2024-01-15T10:30:00Z`,
  },
};

export const Simple: Story = {
  args: {
    message: 'Something went wrong.',
  },
};

export const AuthenticationError: Story = {
  args: {
    title: 'Authentication Failed',
    message: 'Your session has expired. Please sign in again.',
    code: 'ERR_AUTH_401',
  },
};

export const ValidationError: Story = {
  args: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    code: 'ERR_VALIDATION',
    details: `Validation Errors:
- Email: Must be a valid email address
- Password: Must be at least 8 characters long
- Name: This field is required`,
    onRetry: fn(),
  },
};

export const Multiple: Story = {
  args: {
    message: "Multiple error examples",
  },
  render: () => (
    <div className="space-y-4 w-[400px]">
      <ErrorCard
        title="Network Error"
        message="Could not connect to the server."
        code="ERR_NETWORK"
      />
      <ErrorCard
        message="An unexpected error occurred."
        onRetry={fn()}
      />
      <ErrorCard
        title="Not Found"
        message="The requested resource was not found."
        code="ERR_404"
        details="URL: /api/users/12345"
      />
    </div>
  ),
};
