import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Masquer /r/ avec un autre préfixe
    if (url.pathname.startsWith('/components/')) {
        url.pathname = url.pathname.replace('/components/', '/r/');
        return NextResponse.rewrite(url);
    }

    // Ajouter .json si pas présent
    if (url.pathname.startsWith('/r/') && !url.pathname.endsWith('.json')) {
        url.pathname += '.json';
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/components/:path*', '/r/:path*']
};