import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import "../src/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    layout: "padded",
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
