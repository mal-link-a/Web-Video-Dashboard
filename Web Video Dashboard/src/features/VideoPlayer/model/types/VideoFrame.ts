export enum VideoFrameFormat {
  jpg = "jpg",
  png = "png",
}

export type VideoFrame = {
  blob: Blob;
  dataUri: string;
  format: VideoFrameFormat;
};
