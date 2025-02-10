import "./App.css";
import { VideoPlayer } from "./features/VideoPlayer/ui/VideoPlayer/VideoPlayer";
import { Box } from "@chakra-ui/react";
import { store } from "./app/store/store";
import { Provider } from "react-redux";

function App() {
  return (
    <>
      <Provider store={store}>
        <Box backgroundColor="white" maxW="1280px" minW="90%">
          <VideoPlayer />
        </Box>
      </Provider>
    </>
  );
}

export default App;
