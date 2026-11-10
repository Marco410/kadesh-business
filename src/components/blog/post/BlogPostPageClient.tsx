"use client";

import { Footer, Navigation } from 'kadesh/components/layout';
import { usePostView } from 'kadesh/components/blog/hooks/usePostView';
import BlogPostDetailComponent from 'kadesh/components/blog/post/BlogPostDetail';
import type {
  BlogPostDetail,
  BlogSidebarCategory,
  RelatedPostsResult,
} from 'kadesh/components/blog/types';

export default function BlogPostPageClient({
  post,
  related,
  categories,
}: {
  post: BlogPostDetail;
  related?: RelatedPostsResult;
  categories?: BlogSidebarCategory[];
}) {
  usePostView(post.id);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />
      <BlogPostDetailComponent post={post} related={related} categories={categories} />
      <Footer />
    </div>
  );
}
