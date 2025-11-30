import { BlogPost, Concert, Profile, NavItem } from './types';

export const SITE_NAME = "榎田 雅志";
export const SITE_ROLE = "Pianist";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Top', href: 'home' },
  { label: 'Biography', href: 'biography' },
  { label: 'Concert', href: 'concerts' },
  { label: 'Blog', href: 'blog' },
  { label: 'Contact', href: 'contact' },
];

export const PROFILE: Profile = {
  name: "榎田 雅志",
  role: "Pianist",
  // Strictly factual based on provided text
  bioShort: "宮崎県小林市生まれ。5歳よりピアノをはじめ、大分県立芸術緑丘高等学校、愛知県立芸術大学卒業、同大学院修了。UCLAにてヴィタリー・マルグリス氏に師事。アジア各地での演奏活動のほか、ソウル総合芸術大学やハノイ芸術大学にて指導を行う。",
  history: [
    "1986年 宮崎県小林市生まれ",
    "大分県立芸術緑丘高等学校 卒業",
    "愛知県立芸術大学 卒業",
    "2012年 愛知県立芸術大学大学院 修了 / 「最優秀修了生の共演」出演",
    "UCLA（カリフォルニア大学ロサンゼルス校）ヴィタリー・マルグリス氏 マスタークラス受講",
    "2014年 CD「P.カザルスへのオマージュ」リリース",
    "2016年 韓国「Asia 国際現代ピアノ音楽祭」招聘",
    "2017年 ソロ・アルバム「トロイメライ」リリース",
    "2018年 ダン・フー・ファク氏より「主題と変奏」を献呈される"
  ]
};

export const RECENT_POSTS: BlogPost[] = [
  { id: '1', date: '2025.11.27', title: 'ラジオ再放送について', excerpt: '', category: 'Media' },
  { id: '2', date: '2025.11.19', title: 'ラジオ放送ゲスト出演', excerpt: '', category: 'Media' },
  { id: '3', date: '2025.10.29', title: 'YouTube動画公開', excerpt: '', category: 'Video' },
  { id: '4', date: '2025.10.28', title: '公演情報公開', excerpt: '', category: 'Info' },
  { id: '5', date: '2025.09.16', title: 'ショパン：雨だれの前奏曲', excerpt: '', category: 'Video' },
];

export const UPCOMING_CONCERTS: Concert[] = [
  { id: 'c1', date: '2025.12.15', title: 'クリスマス・チャリティ・ガラ', location: '東京オペラシティ リサイタルホール', description: '' },
  { id: 'c2', date: '2026.01.20', title: 'ニューイヤー・ピアノリサイタル', location: '紀尾井ホール', description: '' },
  { id: 'c3', date: '2026.03.10', title: '春のジョイントコンサート', location: '大分 iichiko音の泉ホール', description: '' },
];

// User provided hero images
const HERO_HALL = "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2000&auto=format&fit=crop";
const HERO_NATURE = "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1600&auto=format&fit=crop";

export const IMAGES = {
  // Use specific images for specific themes to match the vibe
  hero_royal: HERO_HALL,
  hero_editorial: HERO_HALL,
  hero_nocturne: HERO_HALL,
  hero_stage: HERO_HALL,
  hero_studio: HERO_NATURE, // Clean, bright
  hero_nature: HERO_NATURE,
};

// Reliable placeholders for non-hero sections
export const PLACEHOLDERS = {
  portrait: "https://images.unsplash.com/photo-1595064567223-1d02c03381a1?q=80&w=800&auto=format&fit=crop", // Male portrait shadow/moody
  piano_detail: "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=800&auto=format&fit=crop",
  concert: "https://images.unsplash.com/photo-1459749411177-33481156047e?q=80&w=800&auto=format&fit=crop",
  sheet_music: "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=800&auto=format&fit=crop",
  blog_1: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop", // Music vibe
  blog_2: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop", // Studio vibe
  blog_3: "https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?q=80&w=800&auto=format&fit=crop", // Elegant vibe
  blog_4: "https://images.unsplash.com/photo-1519681393798-2f772350616b?q=80&w=800&auto=format&fit=crop",
  blog_5: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800&auto=format&fit=crop",
};