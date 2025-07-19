import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Permet d'utiliser /ly-ui/ComponentName pour accéder à /r/ComponentName.json
    if (url.pathname.startsWith('/ly-ui/')) {
        url.pathname = url.pathname.replace('/ly-ui/', '/r/');
        if (!url.pathname.endsWith('.json')) {
            url.pathname += '.json';
        }
        return NextResponse.rewrite(url);
    }

    // Pour compatibilité, on garde aussi /components/ et /r/ -----------
    if (url.pathname.startsWith('/components/')) {
        url.pathname = url.pathname.replace('/components/', '/r/');
        if (!url.pathname.endsWith('.json')) {
            url.pathname += '.json';
        }
        return NextResponse.rewrite(url);
    }

    if (url.pathname.startsWith('/r/') && !url.pathname.endsWith('.json')) {
        url.pathname += '.json';
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/ly-ui/:path*', '/components/:path*', '/r/:path*']
};