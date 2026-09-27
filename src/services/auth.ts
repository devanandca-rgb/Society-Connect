import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import type { SocietyUser, UserRole } from '../types/society';

// Import Firebase config
let firebaseConfig: any = null;
try {
  // Dynamically import or require config
  firebaseConfig = await import('../../firebase-applet-config.json');
  if (firebaseConfig.default) {
    firebaseConfig = firebaseConfig.default;
  }
} catch (e) {
  console.warn('Could not load firebase-applet-config.json', e);
}

const app = firebaseConfig && !getApps().length ? initializeApp(firebaseConfig) : getApps().length ? getApp() : null;
export const auth = app ? getAuth(app) : null;

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    throw new Error('Firebase Auth not configured yet');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  if (auth) {
    await auth.signOut();
  }
  cachedAccessToken = null;
};

// Preset demo society users for instant testing of all 4 roles
export const DEMO_USERS: Record<UserRole, SocietyUser> = {
  committee: {
    id: 'user_mc_01',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@greenwoodheights.org',
    role: 'committee',
    designation: 'Chairman (Managing Committee)',
    flatNumber: 'A-701',
    wing: 'A',
    phone: '+91 98201 44552',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  manager: {
    id: 'user_mgr_01',
    name: 'Vikram Patil',
    email: 'manager@greenwoodheights.org',
    role: 'manager',
    designation: 'Society Estate Manager',
    phone: '+91 99302 88410',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  resident: {
    id: 'user_res_01',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@gmail.com',
    role: 'resident',
    designation: 'Apartment Owner',
    flatNumber: 'B-402',
    wing: 'B',
    phone: '+91 98190 33211',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  guard: {
    id: 'user_grd_01',
    name: 'Bahadur Singh',
    email: 'gate1.security@greenwoodheights.org',
    role: 'guard',
    designation: 'Head Security Guard (Gate 1)',
    phone: '+91 91670 12099',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
};
