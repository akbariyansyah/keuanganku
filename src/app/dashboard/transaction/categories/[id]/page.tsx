'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${params.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error_message || 'Failed to fetch category');
        setCategory(json.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [params.id]);

  async function handleDelete() {
    if (!category) return;
    if (!confirm(`Delete category "${category.name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/categories/${params.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error_message || 'Failed to delete');
      router.push('/categories');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete category');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-lg py-12 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-lg">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {error || 'Category not found'}
          </div>
          <div className="mt-4">
            <Link href="/categories" className="text-blue-600 hover:underline text-sm">
              ← Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Category Detail</h1>
        </div>

        {/* Detail card */}
        <div className="rounded-lg border p-6 space-y-4">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                ID
              </dt>
              <dd className="mt-1 text-sm">{category.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Name
              </dt>
              <dd className="mt-1 text-base font-medium">{category.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {category.description || <span className="italic">No description provided</span>}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created At
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(category.created_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Updated At
                </dt>
                <dd className="mt-1 text-sm">
                  {new Date(category.updated_at).toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>

          <div className="flex gap-3 pt-2 border-t">
            <Link
              href={`/categories/${category.id}/edit`}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
