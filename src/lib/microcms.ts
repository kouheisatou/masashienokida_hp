import { createClient } from 'microcms-js-sdk';

export const client = process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY
  ? createClient({
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
      apiKey: process.env.MICROCMS_API_KEY,
    })
  : null;

// Types definition
export type MicroCMSImage = {
  url: string;
  height: number;
  width: number;
};

export type BlogPost = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: { id: string; name: string } | string; // Depending on how you set it up
  tags?: string[];
  thumbnail?: MicroCMSImage;
  published: boolean;
  membersOnly: boolean;
  requiredRole?: 'MEMBER_FREE' | 'MEMBER_GOLD';
};

export type Concert = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  date: string;
  venue: string;
  location?: string;
  program?: string;
  description?: string;
  image?: MicroCMSImage;
  ticketUrl?: string;
  price?: string;
  isArchived: boolean;
};

export type Discography = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  titleEn?: string;
  releaseDate: string;
  label?: string;
  trackList?: string;
  description?: string;
  coverImage?: MicroCMSImage;
  purchaseUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
};

// Add other types as needed
