import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Navbar from '@/app/components/Navbar'
import { useSession } from 'next-auth/react'

describe('Navbar Component', () => {
    it('renders login link when unauthenticated', () => {
        (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' })
        
        render(<Navbar />)
        
        const loginLink = screen.getByText('Masuk')
        expect(loginLink).toBeInTheDocument()
        expect(loginLink.getAttribute('href')).toBe('/auth/login')
    })

    it('renders profile link when authenticated', () => {
        (useSession as any).mockReturnValue({ 
            data: { user: { id: 'user-1' } }, 
            status: 'authenticated' 
        })
        
        render(<Navbar />)
        
        const profileLink = screen.getByRole('link', { name: /Logo/i }).closest('nav')?.querySelector('a[href*="/profile/user-1"]')
        expect(profileLink).toBeInTheDocument()
    })
})
