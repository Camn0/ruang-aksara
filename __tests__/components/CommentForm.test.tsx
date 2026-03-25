import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CommentForm from '@/app/novel/[karyaId]/[chapterNo]/CommentForm'
import { submitComment } from '@/app/actions/user'

vi.mock('@/app/actions/user', () => ({
    submitComment: vi.fn(),
}))

describe('CommentForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    })

    it('renders the form immediately for top-level comments', () => {
        render(<CommentForm babId="ch-1" />)
        expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders a toggle button for replies', () => {
        render(<CommentForm babId="ch-1" isReply={true} replyToUsername="author1" />)
        expect(screen.getByText('Gores Balasan')).toBeInTheDocument()
    })

    it('opens the reply form when clicked', async () => {
        render(<CommentForm babId="ch-1" isReply={true} replyToUsername="author1" />)
        
        const toggleButton = screen.getByText('Gores Balasan')
        fireEvent.click(toggleButton)
        
        await waitFor(() => {
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })
    })

    it('submits a comment successfully', async () => {
        (submitComment as any).mockResolvedValue({ success: true, data: { id: 'c1' } })
        
        const { container } = render(<CommentForm babId="ch-1" />)
        
        await screen.findByRole('textbox')
        const form = container.querySelector('form')

        if (form) {
            fireEvent.submit(form)
        }

        await waitFor(() => {
            expect(submitComment).toHaveBeenCalled()
            expect(screen.getByText(/berhasil dikirim/i)).toBeInTheDocument()
        })
    })
})
