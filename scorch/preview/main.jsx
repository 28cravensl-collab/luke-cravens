// Standalone browser build of the same landing page (no Next.js server needed).
import { createRoot } from "react-dom/client";
import Landing from "../components/Landing";

createRoot(document.getElementById("root")).render(<Landing />);
