import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateKaryaForm from '@/app/admin/dashboard/CreateKaryaForm'
import { createKarya } from '@/app/actions/admin'

vi.mock('@/app/actions/admin', () => ({
    createKarya: vi.fn(),
}))

describe('CreateKaryaForm Component', () => {
    const mockGenres = [
        { id: '1', name: 'Romance' },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('alert', vi.fn())
    })

    it('renders form fields correctly', () => {
        render(<CreateKaryaForm genres={mockGenres} />)
        expect(screen.getByPlaceholderText(/Contoh: Sang Pemimpi/i)).toBeInTheDocument()
    })

    it('submits form data and shows success alert', async () => {
        const user = userEvent.setup();
        (createKarya as any).mockResolvedValue({ success: true })
        
        render(<CreateKaryaForm genres={mockGenres} />)
        
        const titleInput = screen.getByPlaceholderText(/Contoh: Sang Pemimpi/i)
        const penulisInput = screen.getByPlaceholderText(/Contoh: Andrea Hirata/i)
        const submitButton = screen.getByRole('button', { name: /Buat Karya/i })
        
        await user.type(titleInput, 'Novel Test')
        await user.type(penulisInput, 'Penulis Test')
        await user.click(submitButton)

        await waitFor(() => {
            expect(createKarya).toHaveBeenCalled()
        }, { timeout: 3000 })
    })
})
