import { render, screen, fireEvent } from '@testing-library/react';
import { ProductGrid } from './product-grid';
import type { Product } from '@/types/product';

// --- Mock de ProductCard para no depender del componente real --- //
const mockProductCard = jest.fn(
  (props: any) => (
    <div
      data-testid="product-card"
      data-product-id={props.product.idProd}
      data-is-favorite={props.isFavorite ? 'true' : 'false'}
      onClick={() => props.onProductClick(props.product)}
    >
      {props.product.NomProducto}
    </div>
  ),
);

jest.mock('./product-card', () => ({
  ProductCard: (props: any) => mockProductCard(props),
}));

const baseProducts: Product[] = [
  {
    idProd: 'P1',
    NomProducto: 'Lapicero Azul',
    Descripcion: 'Lapicero de tinta azul',
    PrecioUnitario: 2,
    Stock: 10,
    marca: 'BIC',
  } as any,
  {
    idProd: 'P2',
    NomProducto: 'Cuaderno rayado',
    Descripcion: 'Cuaderno universitario',
    PrecioUnitario: 8,
    Stock: 5,
    marca: 'Standford',
  } as any,
];

const setup = (override: Partial<React.ComponentProps<typeof ProductGrid>> = {}) => {
  const defaultProps: React.ComponentProps<typeof ProductGrid> = {
    products: baseProducts,
    activeTab: 'productos',
    onTabChange: jest.fn(),
    onToggleFavorite: jest.fn(),
    onAddToCart: jest.fn(),
    onProductClick: jest.fn(),
    favoriteProductIds: ['P2'],
  };

  const props = { ...defaultProps, ...override };

  mockProductCard.mockClear();

  const utils = render(<ProductGrid {...props} />);

  return { props, ...utils };
};

describe('ProductGrid', () => {
  it('PGRID-001: renderiza una ProductCard por producto y marca favoritos correctamente', () => {
    const { props } = setup();

    // Se crean 2 "product-card"
    const cards = screen.getAllByTestId('product-card');
    expect(cards).toHaveLength(props.products.length);

    // Mock de ProductCard llamado con cada producto
    expect(mockProductCard).toHaveBeenCalledTimes(props.products.length);

    const firstCallArgs = mockProductCard.mock.calls[0][0];
    const secondCallArgs = mockProductCard.mock.calls[1][0];

    // Primer producto no es favorito
    expect(firstCallArgs.product.idProd).toBe('P1');
    expect(firstCallArgs.isFavorite).toBe(false);

    // Segundo producto sí es favorito (id incluido en favoriteProductIds)
    expect(secondCallArgs.product.idProd).toBe('P2');
    expect(secondCallArgs.isFavorite).toBe(true);
  });

  it('PGRID-002: al hacer clic en las tabs llama a onTabChange con el valor correcto', () => {
    const { props } = setup();

    const btnFavoritos = screen.getByRole('button', { name: /Sección de Favoritos/i });
    const btnProductos = screen.getByRole('button', { name: /Lista de Productos/i });

    fireEvent.click(btnFavoritos);
    expect(props.onTabChange).toHaveBeenCalledWith('favoritos');

    fireEvent.click(btnProductos);
    expect(props.onTabChange).toHaveBeenCalledWith('productos');
  });

  it('PGRID-003: muestra mensaje de “no encontrados” y sugerencia de filtros cuando no hay productos en tab productos', () => {
    setup({
      products: [],
      activeTab: 'productos',
    });

    expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Intenta ajustar tus filtros de búsqueda/i),
    ).toBeInTheDocument();
  });

  it('PGRID-004: muestra mensaje de favoritos vacío cuando tab activos es "favoritos" sin productos', () => {
    setup({
      products: [],
      activeTab: 'favoritos',
    });

    expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No tienes productos favoritos aún/i),
    ).toBeInTheDocument();
  });

  it('PGRID-005: cuando hay productos no se muestra el mensaje vacío', () => {
    setup({
      products: baseProducts,
      activeTab: 'productos',
    });

    expect(
      screen.queryByText(/No se encontraron productos/i),
    ).not.toBeInTheDocument();
  });
});
