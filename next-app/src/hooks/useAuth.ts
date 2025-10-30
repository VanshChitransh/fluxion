'use client';

import { useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/user';
import { GAME_CONSTANTS } from '../lib/constants';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      await createUserProfileIfNeeded(result.user);
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      await createUserProfileIfNeeded(result.user);
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error: any) {
      console.error('Sign-out error:', error);
      return { success: false, error: error.message };
    }
  };

  const createUserProfileIfNeeded = async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile with initial ELO
      const newProfile: Partial<UserProfile> = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Anonymous',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        elo: {
          rating: GAME_CONSTANTS.STARTING_ELO,
          tier: 'Bronze Trader',
          tierLevel: 1,
          highestElo: GAME_CONSTANTS.STARTING_ELO,
          lastUpdated: serverTimestamp() as any,
        },
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0,
          currentStreak: 0,
          bestStreak: 0,
          predictBattles: {
            played: 0,
            correct: 0,
            accuracy: 0,
          },
          battleRoyale: {
            played: 0,
            wins: 0,
            avgProfitLoss: 0,
          },
        },
        nftRewards: [],
        createdAt: serverTimestamp() as any,
        lastActive: serverTimestamp() as any,
      };

      await setDoc(userRef, newProfile);
      
      // Also create leaderboard entry
      const leaderboardRef = doc(db, 'leaderboard', firebaseUser.uid);
      await setDoc(leaderboardRef, {
        userId: firebaseUser.uid,
        displayName: newProfile.displayName,
        photoURL: newProfile.photoURL,
        elo: GAME_CONSTANTS.STARTING_ELO,
        tier: 'Bronze Trader',
        tierLevel: 1,
        points: 0,
        wins: 0,
        totalGames: 0,
        winRate: 0,
        rank: 0, // Will be updated by cloud function
        updatedAt: serverTimestamp(),
      });
    }
  };

  return {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}

