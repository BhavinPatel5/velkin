import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { velkin } from "@velkin/ui/vite";
import { velkinReact } from "@velkin/react/vite";

export default defineConfig({
  plugins: [react(), velkin(), velkinReact()].flat(),
});
