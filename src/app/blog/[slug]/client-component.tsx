"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    image?: string;
  };
}

export function BlogPostContent({ slug }: { slug: string }) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
      } else {
        setError('Blog post not found');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Blog post not found'}</h1>
          <p className="mb-6">The blog post you're looking for doesn't exist or isn't published.</p>
          <Link href="/blog" className="bg-blue-600 text-white px-4 py-2 rounded">
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      <article className="container mx-auto px-4 py-12">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Back to Blog
        </Link>
        
        {blog.imageUrl && (
          <div className="mb-8 h-96 overflow-hidden rounded-lg">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
        
        <div className="flex items-center text-gray-600 mb-8">
          <span>
            {new Date(blog.createdAt).toLocaleDateString()} • by {blog.user.name || 'Admin'}
          </span>
        </div>
        
        <div className="prose lg:prose-xl max-w-none">
          {blog.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}