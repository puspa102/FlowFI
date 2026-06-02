import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import Skeleton from '@/components/ui/Skeleton'
import { setToken } from '@/store/slices/authSlice'

export default function AuthCallback() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')
    console.log('Auth callback has token:', !!token)
    console.log('Auth callback error:', error)

    if (token) {
      dispatch(setToken(token))
      navigate('/dashboard', { replace: true })
      return
    }

    if (!error && localStorage.getItem('flofi_token')) {
      navigate('/dashboard', { replace: true })
      return
    }

    const message = error || 'Google token exchange failed'
    navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true })
  }, [dispatch, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
      <div className="space-y-4 w-full max-w-sm px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  )
}
