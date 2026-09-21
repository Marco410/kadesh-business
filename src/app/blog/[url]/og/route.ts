import { NextResponse } from 'next/server';
import { SITE_URL } from 'kadesh/core/site';
import {
  BLOG_OG_IMAGE,
  resolvePostImageSource,
} from 'kadesh/components/blog/blog-seo';
import { fetchPublishedPostByUrl } from 'kadesh/components/blog/server';

export const revalidate = 3600;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CACHE_CONTROL =
  'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

function fallbackResponse() {
  return NextResponse.redirect(`${SITE_URL}${BLOG_OG_IMAGE}`, {
    status: 302,
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ url: string }> },
) {
  const { url } = await params;
  const post = await fetchPublishedPostByUrl(url);
  const source = resolvePostImageSource(post?.image?.url);

  if (!source) {
    return fallbackResponse();
  }

  try {
    const upstream = await fetch(source, { cache: 'no-store' });
    const contentType = upstream.headers.get('content-type') ?? '';

    if (!upstream.ok || !contentType.startsWith('image/')) {
      return fallbackResponse();
    }

    const body = await upstream.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) {
      return fallbackResponse();
    }

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error('Blog share image fetch failed:', error);
    return fallbackResponse();
  }
}
