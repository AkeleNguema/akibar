import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as syncService from '../services/syncService';

// Mock du localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) { return store[key] || null; },
    setItem(key: string, value: string) { store[key] = value.toString(); },
    clear() { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

vi.mock('../services/syncService', () => ({
  isOnline: vi.fn(() => true),
  syncOfflineSales: vi.fn(),
  initSyncListeners: vi.fn(() => vi.fn()),
}));

describe('App Component Roles', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders login screen if not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Bienvenue sur AKIBAR/i)).toBeInTheDocument();
  });

  it('hides sensitive tabs for SERVEUR role', async () => {
    const fakePayload = btoa(JSON.stringify({ role: 'SERVEUR' }));
    window.localStorage.setItem('token', `header.${fakePayload}.sig`);
    window.localStorage.setItem('bar', JSON.stringify({ id: '1', nomBar: 'Test Bar', role: 'SERVEUR' }));

    render(<App />);
    
    // Le serveur doit voir la caisse
    expect(screen.getByText('Caisse / Vente')).toBeInTheDocument();
    
    // Le serveur NE doit PAS voir le dashboard ou le stock
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Approvisionnement & Stock')).not.toBeInTheDocument();
  });

  it('shows all tabs for GERANT role', async () => {
    const fakePayload = btoa(JSON.stringify({ role: 'GERANT' }));
    window.localStorage.setItem('token', `header.${fakePayload}.sig`);
    window.localStorage.setItem('bar', JSON.stringify({ id: '1', nomBar: 'Test Bar', role: 'GERANT' }));

    render(<App />);
    
    expect(screen.getByText('Caisse / Vente')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Approvisionnement & Stock')).toBeInTheDocument();
  });
});
