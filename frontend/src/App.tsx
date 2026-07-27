import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import ViewerPage from "@/pages/ViewerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collectibles/:id" element={<ViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
