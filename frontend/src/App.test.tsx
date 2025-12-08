import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Mock fetch
const mockFetch = (data: any) => {
  global.fetch = jest.fn().mockResolvedValue({ json: async () => data }) as any
}

test('renders and shows no tasks initially with mocked fetch', async () => {
  mockFetch([])
  render(<App />)
  expect(await screen.findByText(/No tasks/i)).toBeInTheDocument()
})

test('adds a task triggers POST', async () => {
  mockFetch([])
  render(<App />)
  const input = screen.getByPlaceholderText('Title')
  fireEvent.change(input, { target: { value: 'My Task' } })
  const btn = screen.getByText('Add')
  // Mock POST
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ json: async () => [] }) // initial GET
    .mockResolvedValueOnce({}) // POST
    .mockResolvedValueOnce({ json: async () => [{ id:1, title:'My Task', description:'', isCompleted:false, createdAt:'' }] }) // reload GET
  fireEvent.click(btn)
  expect(await screen.findByText('My Task')).toBeInTheDocument()
})
