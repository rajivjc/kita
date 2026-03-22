'use client'

import { signOut } from '@/app/account/actions'

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="w-full border border-red-200 dark:border-red-400/20 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/15 active:scale-[0.97] rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
      >
        Sign out
      </button>
    </form>
  )
}
