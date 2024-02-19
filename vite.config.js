// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "QrCodeStyling",
      fileName: (format) => `qr-code-styling.${format}.js`
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library
      external: ["qrcode-generator"],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          "qrcode-generator": "qrcodeGenerator"
        }
      }
    }
  }
});
