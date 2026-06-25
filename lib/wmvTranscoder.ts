export interface WmvTranscoder {
  transcodeToMp4(
    file: File,
    onProgress?: (ratio: number) => void,
  ): Promise<Blob>;
}
