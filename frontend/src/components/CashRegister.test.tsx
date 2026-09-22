import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CashRegister } from './CashRegister';
import * as stockService from '../services/stockService';

// Mock du service stock
vi.mock('../services/stockService', () => ({
  getProducts: vi.fn(),
}));

const mockProducts = [
  { id: '1', nom: 'Beaufort', prixVenteBouteille: 1000, stocks: [{ quantiteBouteilles: 10 }] },
  { id: '2', nom: 'Régab', prixVenteBouteille: 800, stocks: [{ quantiteBouteilles: 0 }] }
];

describe('CashRegister Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (stockService.getProducts as any).mockResolvedValue(mockProducts);
  });

  it('renders products and adds them to cart', async () => {
    render(<CashRegister />);
    
    // Le composant charge les produits
    const beaufortBtn = await screen.findByRole('button', { name: /Ajouter Beaufort au panier/i });
    expect(beaufortBtn).toBeInTheDocument();

    // On clique pour ajouter au panier
    fireEvent.click(beaufortBtn);

    // Vérifie que le panier affiche 1 Beaufort et le total est 1000
    expect(screen.getAllByText('Beaufort').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1\s*(000| 000)\s*FCFA/).length).toBeGreaterThan(0);
    
    // Le total global
    const totalDiv = screen.getByText(/Total :/i).parentElement;
    expect(totalDiv).toHaveTextContent(/1\s*(000| 000)\s*FCFA/);
  });

  it('does not add out-of-stock products', async () => {
    render(<CashRegister />);
    
    const regabBtn = await screen.findByRole('button', { name: /Ajouter Régab au panier/i });
    expect(regabBtn).toBeDisabled();
  });
});
