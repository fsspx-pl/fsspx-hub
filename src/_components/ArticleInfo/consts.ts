const now = new Date();

export const defaultAvatar = {
    id: '1',
    url: 'https://placehold.co/30x30.jpg',
    filename: 'avatar',
    mimeType: 'image/jpeg',
    filesize: 1024,
    width: 30,
    height: 30,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    alt: 'Avatar image',
  }