// App types
export type Blog = {
  id: string;
  _id?: string; // Firebase/MongoDB compatibility
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  minutesRead: number;
  categories: string[];
  placement: "none" | "top" | "monthly" | "latest";
  isFeatured: boolean;
  thumbnailUrl: string;
  publishedAt: string | number | { seconds: number; nanoseconds: number; toDate?: () => Date };
  createdAt?: string | number | { seconds: number; nanoseconds: number; toDate?: () => Date };
  updatedAt?: string | number | { seconds: number; nanoseconds: number; toDate?: () => Date };
  likes?: number;
  monthlyOrder?: string[];
  likedBy?: string[];
};
