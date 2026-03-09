'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${params.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error_message || 'Failed to fetch category');
        setName(json.data.name);
        setDescription(json.data.description ?? '');
      } catch (e: unknown) {
        setFetchError(e instanceof Error ? e.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error_message || 'Failed to update category');

      router.push(`/categories/${params.id}`);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-lg py-12 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-lg">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {fetchError}
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
          <Link
            href={`/categories/${params.id}`}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Category</h1>
        </div>

        {/* Form */}
        <div className="rounded-lg border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Food & Dining"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium">
                Description{' '}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this category"
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
              <Link
                href={`/categories/${params.id}`}
                className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
