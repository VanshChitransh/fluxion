import { NextRequest } from 'next/server';
import { adminAuth } from './firebaseAdmin';

export async function verifyAuthToken(request: NextRequest): Promise<{
  valid: boolean;
  uid?: string;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'No authorization token provided' };
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);

    return { valid: true, uid: decodedToken.uid };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { valid: false, error: 'Invalid or expired token' };
  }
}

export function createAuthResponse(error: string, status: number = 401) {
  return Response.json(
    { error, success: false },
    { status }
  );
}

