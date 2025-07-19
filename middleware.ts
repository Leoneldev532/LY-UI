

import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    if (url.pathname.startsWith('/ly-ui/')) {
        const comp = url.pathname.replace('/ly-ui/', '');
        url.pathname = `/r/${comp}.json`;
        return NextResponse.rewrite(url);
    }

 
    if (url.pathname.startsWith('/components/')) {
        url.pathname = url.pathname.replace('/components/', '/r/');
        // Ajoute .json si manquant
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
    matcher: [
        '/components/:path*',
        '/r/:path*',
        '/ly-ui/:path*', 
    ]
};