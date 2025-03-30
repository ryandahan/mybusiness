import { BlogPostContent } from './client-component';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostContent slug={params.slug} />;
}