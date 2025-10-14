export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new Response('Not authenticated', { status: 403 });
    }

    const authValue = authHeader.split(' ')[1];
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');

    if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASSWORD) {
        return new Response('OK', { status: 200 });
    }

    return new Response('Not authenticated', { status: 403 });
}