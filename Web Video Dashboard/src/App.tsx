import "./App.css";
import { VideoPlayer } from "./features/VideoPlayer/ui/VideoPlayer/VideoPlayer";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <>
      <Box backgroundColor="white" maxW="1280px" minW="90%">
        <VideoPlayer />
      </Box>
    </>
  );
}

export default App;
