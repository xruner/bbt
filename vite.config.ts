/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
  server: {
    allowedHosts: ['a2.xruner.tk'], // ✅ 移除分号，改用逗号
    proxy: {
      '/api': {
        target: 'https://c.xruner.tk/api/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
