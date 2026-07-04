import React from "react";
import Login from "./components/Login";
import HomePage from "./pages/HomePage";
import CapturePage from "./pages/CapturePage";
// import UploadTest2 from "./pages/UploadTest2";

const App = () => {
  return (
    <div>
      <Login />
      <HomePage />
      <CapturePage />
      {/* <UploadTest2 /> */}
    </div>
  );
};

export default App;
