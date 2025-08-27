// Image utility functions

export const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop";

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const getImageUrl = (url: string): string => {
  if (!isValidImageUrl(url)) {
    return DEFAULT_IMAGE_URL;
  }
  return url;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  const target = e.target as HTMLImageElement;
  target.src = DEFAULT_IMAGE_URL;
};
