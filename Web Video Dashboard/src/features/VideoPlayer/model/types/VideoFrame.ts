export enum VideoFrameFormat {
  jpg = "jpeg",
  png = "png",
}

export type VideoFrame = {
  blob: Blob;
  dataUri: string;
  format: VideoFrameFormat;
};
