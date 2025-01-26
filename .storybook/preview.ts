import type { Preview } from "@storybook/react";
import '../src/_css/globals.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#333' },
        light: { name: 'Light', value: '#F7F9F2' },
        white: { name: 'White', value: '#fff' }
      },
      default: 'Light'
    },
  },
};

export default preview;
