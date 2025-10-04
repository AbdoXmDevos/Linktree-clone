import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

interface UrlMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  url: string;
}

// Helper function to extract metadata from HTML
function extractMetadata(html: string, url: string): UrlMetadata {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Helper to get meta content by property or name
  const getMeta = (selector: string): string | null => {
    const element = document.querySelector(selector);
    return element?.getAttribute('content') || null;
  };

  // Extract title
  let title = 
    getMeta('meta[property="og:title"]') ||
    getMeta('meta[name="twitter:title"]') ||
    document.querySelector('title')?.textContent ||
    '';

  // Extract description
  let description = 
    getMeta('meta[property="og:description"]') ||
    getMeta('meta[name="twitter:description"]') ||
    getMeta('meta[name="description"]') ||
    '';

  // Extract image
  let image = 
    getMeta('meta[property="og:image"]') ||
    getMeta('meta[name="twitter:image"]') ||
    getMeta('meta[name="twitter:image:src"]') ||
    '';

  // Extract favicon
  let favicon = '';
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]'
  ];
  
  for (const selector of faviconSelectors) {
    const faviconElement = document.querySelector(selector);
    if (faviconElement) {
      favicon = faviconElement.getAttribute('href') || '';
      break;
    }
  }

  // Extract site name
  let siteName = 
    getMeta('meta[property="og:site_name"]') ||
    getMeta('meta[name="application-name"]') ||
    '';

  // Clean and validate URLs
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  // Convert relative URLs to absolute
  if (image && !image.startsWith('http')) {
    if (image.startsWith('//')) {
      image = `${urlObj.protocol}${image}`;
    } else if (image.startsWith('/')) {
      image = `${baseUrl}${image}`;
    } else {
      image = `${baseUrl}/${image}`;
    }
  }

  if (favicon && !favicon.startsWith('http')) {
    if (favicon.startsWith('//')) {
      favicon = `${urlObj.protocol}${favicon}`;
    } else if (favicon.startsWith('/')) {
      favicon = `${baseUrl}${favicon}`;
    } else {
      favicon = `${baseUrl}/${favicon}`;
    }
  }

  // If no favicon found, try default location
  if (!favicon) {
    favicon = `${baseUrl}/favicon.ico`;
  }

  // Clean up text content
  title = title.trim().substring(0, 100);
  description = description.trim().substring(0, 200);

  return {
    title: title || undefined,
    description: description || undefined,
    image: image || undefined,
    favicon: favicon || undefined,
    siteName: siteName || undefined,
    url
  };
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Set up fetch options with timeout and headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkBot/1.0; +https://yoursite.com/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { 
            error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
            url 
          },
          { status: 400 }
        );
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        return NextResponse.json(
          { 
            error: 'URL does not return HTML content',
            url 
          },
          { status: 400 }
        );
      }

      // Check content length (limit to 5MB)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
        return NextResponse.json(
          { 
            error: 'Content too large to process',
            url 
          },
          { status: 400 }
        );
      }

      const html = await response.text();
      
      // Extract metadata
      const metadata = extractMetadata(html, url);

      return NextResponse.json({
        success: true,
        metadata
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Request timeout - URL took too long to respond',
            url 
          },
          { status: 408 }
        );
      }

      return NextResponse.json(
        { 
          error: `Network error: ${fetchError.message}`,
          url 
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Metadata extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error while processing URL',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}