import { create } from 'zustand'
import { combine } from 'zustand/middleware'

type GeneralProps = {
  userType?: UserType
  userTab?: string
}

export const useGeneralStore = create(
  combine(
    {
      userType: undefined as UserType | undefined,
      userTab: '',
    } as GeneralProps,
    (set) => {
      return {
        actions: {
          setUserType: (type: UserType): void => set({ userType: type }),
          setUserTab: (tab: string): void => set({ userTab: tab }),
        },
      }
    },
  ),
)
