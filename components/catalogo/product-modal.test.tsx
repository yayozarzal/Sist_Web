import { render, fireEvent } from '@testing-library/react';
import { ProductModal } from './product-modal';
import type { Product } from '@/types/product';

// Mockeamos los helpers para tener resultados predecibles
jest.mock('@/utils/product-helpers', () => ({
  getCategoryBadge: () => ({ text: 'Categoría X', className: 'bg-red-500' }),
  formatPrice: (value: number) => `$${value.toFixed(2)}`,
}));

const mockProduct: Product = {
  idProd: 'P1',
  NomProducto: 'Producto 1',
  Descripcion: 'Descripción de prueba',
  PrecioUnitario: 10,
  PrecioMayor: null as any,
  Stock: 5,
  marca: 'MarcaTest',
  Imagen: null,
  idCategoria: 1 as any,
  Estado: true as any,
  // campo usado por getCategoryBadge
  categoria: 'papeleria' as any,
};

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  product: mockProduct,
  onToggleFavorite: jest.fn(),
  onAddToCart: jest.fn(),
  isFavorite: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// Opcional: silenciar warnings de Radix Dialog en consola
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore?.();
});

describe('ProductModal', () => {
  it('PMOD-001: muestra la información básica del producto cuando está abierto', () => {
    const { getByText } = render(<ProductModal {...baseProps} />);

    // título con el nombre
    expect(getByText(/Producto 1/i)).toBeInTheDocument();

    // badge de categoría (mockeado)
    expect(getByText(/Categoría X/i)).toBeInTheDocument();

    // marca
    expect(getByText(/Marca: MarcaTest/i)).toBeInTheDocument();

    // precio formateado (10 => $10.00)
    expect(getByText(/\$10\.00/)).toBeInTheDocument();

    // descripción
    expect(getByText(/Descripción de prueba/i)).toBeInTheDocument();
  });

  it('PMOD-002: el botón de favorito llama a onToggleFavorite con el id del producto', () => {
    const onToggleFavorite = jest.fn();

    const { getByRole } = render(
      <ProductModal
        {...baseProps}
        onToggleFavorite={onToggleFavorite}
        isFavorite={false}
      />
    );

    const favButton = getByRole('button', {
      name: /Agregar a favoritos/i,
    });

    fireEvent.click(favButton);

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith('P1');
  });

  it('PMOD-003: al hacer click en "Agregar al carrito" llama a onAddToCart con cantidad 1 y cierra el modal', () => {
    const onAddToCart = jest.fn();
    const onClose = jest.fn();

    const { getByRole } = render(
      <ProductModal
        {...baseProps}
        onAddToCart={onAddToCart}
        onClose={onClose}
      />
    );

    const addButton = getByRole('button', {
      name: /Agregar al carrito/i,
    });

    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith('P1', 1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
