"use client";

import { Footer, Navigation } from 'kadesh/components/layout';
import { usePostView } from 'kadesh/components/blog/hooks/usePostView';
import BlogPostDetailComponent from 'kadesh/components/blog/post/BlogPostDetail';
import type { BlogPostDetail } from 'kadesh/components/blog/types';

export default function BlogPostPageClient({ post }: { post: BlogPostDetail }) {
  usePostView(post.id);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />
      <BlogPostDetailComponent post={post} />
      <Footer />
    </div>
  );
}
