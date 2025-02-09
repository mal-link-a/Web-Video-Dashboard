import { DownloadIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { VideoFrameFormat } from "../../model/types/VideoFrame";

import { downloadBlob } from "../../lib/downloadBlob";
import { captureVideoFrame } from "capture-video-frame";
import FilePlayer from "react-player/file";
interface Props {
  reactPlayer: FilePlayer | null;
  isVisible: boolean;
}
//Делаем скриншот из React Player.
export const Screenshoter = ({ reactPlayer, isVisible }: Props) => {
  const onTakeScreenshot = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const format = e.currentTarget.getAttribute("data-type");
    //Получаем изображение с помощью библиотеки capture-video-frame
    if (reactPlayer !== null) {
      const frame = await captureVideoFrame(
        reactPlayer.getInternalPlayer(),
        format,
        1
      );
      //Сохраняем
      if (typeof frame != "boolean") {
        downloadBlob(frame.blob);
      }
      //captureVideoFrame возвращает false, если не сработает
      else {
        throw new Error("captureVideoFrame не смог захватить изображение");
      }
    }
  };

  return (
    <Menu>
      <MenuButton
        variant="outline"
        size={["xs", "md", "md"]}
        w={["28.px", "50px"]}
        padding={0}
        visibility={isVisible ? "visible" : "hidden"}
        bg="transparent"
        _hover={{ bg: "transparent" }}
        as={Button}
      >
        <DownloadIcon
          position={"absolute"}
          top="50%"
          left="50%"
          transform={"translate(-50%, -50%)"}
        />
      </MenuButton>
      <MenuList>
        {Object.entries(VideoFrameFormat).map(([key, value]) => (
          <MenuItem key={key} data-type={value} onClick={onTakeScreenshot}>
            {key}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
