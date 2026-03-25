import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Sidebar from '@/app/components/Sidebar'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/app/components/SidebarContext'

// Mock Sidebar Context
vi.mock('@/app/components/SidebarContext', () => ({
    useSidebar: vi.fn(),
    SidebarProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Sidebar Component', () => {
    const mockToggle = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks();
        (useSidebar as any).mockReturnValue({
            isExpanded: true,
            setIsExpanded: vi.fn(),
            toggleSidebar: mockToggle
        });
        (usePathname as any).mockReturnValue('/');
        (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' })
    })

    it('renders navigation items when expanded', () => {
        render(<Sidebar />)
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Library')).toBeInTheDocument()
    })

    it('hides itself on auth routes', () => {
        (usePathname as any).mockReturnValue('/auth/login')
        const { container } = render(<Sidebar />)
        expect(container.firstChild).toBeNull()
    })

    it('triggers toggleSidebar when button is clicked', () => {
        render(<Sidebar />)
        const toggleButton = screen.getByRole('button')
        fireEvent.click(toggleButton)
        expect(mockToggle).toHaveBeenCalledTimes(1)
    })

    it('shows Studio link only for admin/author roles', () => {
        (useSession as any).mockReturnValue({ 
            data: { user: { id: 'author-1', role: 'author' } }, 
            status: 'authenticated' 
        })
        render(<Sidebar />)
        expect(screen.getByText('Studio Penulis')).toBeInTheDocument()
    })
})
