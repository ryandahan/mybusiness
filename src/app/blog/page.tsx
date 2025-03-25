"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Store Transitions Blog</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Latest insights, tips, and success stories about store closings and transitions
          </p>
        </div>
      </section>
      
      <section className="py-12 container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {blog.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={blog.imageUrl} 
                      alt={blog.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {new Date(blog.createdAt).toLocaleDateString()} • by {blog.user.name || 'Admin'}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {blog.content.substring(0, 150)}
                    {blog.content.length > 150 ? '...' : ''}
                  </p>
                  <Link 
                    href={`/blog/${blog.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </main>
  );
}