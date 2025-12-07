import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const audioUrl = searchParams.get('url');

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Validate that the URL is from an allowed domain (security measure)
    const allowedDomains = [
      'github.com',
      'githubusercontent.com',
      'foldr.space',
      'cloudflare.com',
      'cloudflarestream.com',
      'amazonaws.com',        // AWS S3
      's3.amazonaws.com',
      'storage.googleapis.com', // Google Cloud Storage
      'dropbox.com',
      'dropboxusercontent.com',
      'onedrive.live.com',
      '1drv.ms',
      'drive.google.com',
      'adilo.bigcommand.com',  // Adilo (already used in your app)
      // Add other trusted domains here
    ];

    const urlObj = new URL(audioUrl);
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'URL domain not allowed' },
        { status: 403 }
      );
    }

    // Get the Range header from the client request
    const range = request.headers.get('range');

    // Prepare headers for the upstream request
    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (compatible; AudioProxy/1.0)',
    };

    // If client sent a Range request, forward it
    if (range) {
      upstreamHeaders['Range'] = range;
    }

    // Fetch the audio file from the source
    const response = await fetch(audioUrl, {
      headers: upstreamHeaders,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch audio file' },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');

    // Prepare response headers
    const responseHeaders = {
      'Content-Type': contentType,
      'Accept-Ranges': acceptRanges || 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    // If the upstream server sent a partial content response (206)
    if (response.status === 206) {
      const contentRange = response.headers.get('content-range');
      
      if (contentRange) {
        responseHeaders['Content-Range'] = contentRange;
      }
      
      if (contentLength) {
        responseHeaders['Content-Length'] = contentLength;
      }

      // Return 206 Partial Content with the audio stream
      return new NextResponse(response.body, {
        status: 206,
        headers: responseHeaders,
      });
    }

    // If it's a full content response (200)
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Audio proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
