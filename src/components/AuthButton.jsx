import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function AuthButton() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function loginWithDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
      }
    })
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 p-4 mt-auto border-t border-white/10">
        <img
          src={user.user_metadata.avatar_url}
          alt="avatar"
          className="w-7 h-7 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-white truncate">
            {user.user_metadata.full_name}
          </p>
        </div>
        <button
          onClick={logout}
          className="text-xs font-mono transition-all"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 mt-auto border-t border-white/10">
      <button
        onClick={loginWithDiscord}
        className="w-full py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90"
        style={{ background: '#fbc059', color: '#ffffff' }}
      >
        Connexion Discord
      </button>
    </div>
  )
}

export default AuthButton