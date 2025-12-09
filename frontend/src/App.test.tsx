import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// Mock fetch
const mockFetch = (data: any) => {
  global.fetch = jest.fn().mockResolvedValue({ 
    ok: true,
    json: async () => data 
  }) as any
}

test('renders and shows no tasks initially with mocked fetch', async () => {
  mockFetch([])
  render(<App />)
  expect(await screen.findByText(/No tasks/i)).toBeInTheDocument()
})

test('adds a task triggers POST', async () => {
  // Mock fetch for all requests
  const mockFetchImpl = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial GET
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, title: 'My Task', description: '', isCompleted: false, createdAt: new Date().toISOString() }) }) // POST
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, title: 'My Task', description: '', isCompleted: false, createdAt: new Date().toISOString() }] }) // GET reload
  
  global.fetch = mockFetchImpl as any
  
  render(<App />)
  
  const input = screen.getByPlaceholderText('Title')
  fireEvent.change(input, { target: { value: 'My Task' } })
  
  const btn = screen.getByText('Add')
  fireEvent.click(btn)
  
  await waitFor(() => {
    expect(screen.getByText('My Task')).toBeInTheDocument()
  })
})

