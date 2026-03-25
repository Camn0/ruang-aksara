import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LogoutButton from '@/app/components/LogoutButton'
import { signOut } from 'next-auth/react'

describe('LogoutButton Component', () => {
    it('renders the generic logout title when collapsed', () => {
        render(<LogoutButton expanded={false} />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button.getAttribute('title')).toBe('Keluar Sesi')
    })

    it('triggers the secure signOut mutation on click', () => {
        render(<LogoutButton expanded={true} />)
        const button = screen.getByRole('button')
        
        fireEvent.click(button)

        expect(signOut).toHaveBeenCalledTimes(1)
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' })
    })
})
