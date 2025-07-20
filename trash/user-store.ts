import { persist } from 'zustand/middleware'
import { create } from 'zustand'

export interface UserState {
    currentUser: string | null
    setUser: (user: { uid: string } | null) => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            currentUser: null, // Default to null instead of "guest"
            setUser: (user: { uid: string } | null) => {
                if (!user) {
                    console.log('User store clearing user');
                    set({ currentUser: null });
                    return;
                }
                
                const userIdToSet = user.uid;
                console.log('User store updating to:', userIdToSet);
                set({ currentUser: userIdToSet });
            },
        }),
        {
            name: 'friday-user-storage',
            partialize: (state) => ({ currentUser: state.currentUser }),
        }
    )
)