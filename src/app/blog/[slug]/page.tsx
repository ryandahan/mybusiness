import React from 'react';
import { BlogPostContent } from './client-component';
export default function BlogPostPage({ params }: { params: any }) {
const slug = (React.use(params) as { slug: string }).slug;
return <BlogPostContent slug={slug} />;
}