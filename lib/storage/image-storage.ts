export type StoredImage = {
  url: string;
};

export class InvalidImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageError";
  }
}

export interface ImageStorage {
  save(file: File): Promise<StoredImage>;
  delete(imageUrl: string | null): Promise<void>;
}
