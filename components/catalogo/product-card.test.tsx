import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './product-card';
import type { Product } from '@/types/product';
import { getCategoryBadge, formatPrice } from '@/utils/product-helpers';

// --- Mocks --- //
jest.mock('next/image', () => (props: any) => (
  // Mock simple de <Image /> como <img>
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={props.alt} src={props.src} />
));

jest.mock('@/utils/product-helpers', () => ({
  getCategoryBadge: jest.fn(() => ({
    className: 'bg-test-badge',
    text: 'TEST BADGE',
  })),
  formatPrice: jest.fn((value: number) => `S/ ${value.toFixed(2)}`),
}));

const mockedGetCategoryBadge = getCategoryBadge as jest.Mock;
const mockedFormatPrice = formatPrice as jest.Mock;

const baseProduct: Product = {
  idProd: 'P1',
  NomProducto: 'Producto Demo',
  Descripcion: 'Descripción de prueba',
  PrecioUnitario: 10,
  PrecioMayor: 8,
  Stock: 10,
  marca: 'Marca X',
  Imagen: 'https://ejemplo.com/img.jpg',
  categoria: {
    idCategoria: 1,
    NomCategoria: 'Papelería',
  } as any,
};

const setup = (override: Partial<Product> = {}, propsOverride: any = {}) => {
  const product: Product = { ...baseProduct, ...override };

  const props = {
    product,
    isFavorite: false,
    onToggleFavorite: jest.fn(),
    onAddToCart: jest.fn(),
    onProductClick: jest.fn(),
    ...propsOverride,
  };

  mockedGetCategoryBadge.mockClear();
  mockedFormatPrice.mockClear();

  const utils = render(<ProductCard {...props} />);
  return { product, props, ...utils };
};

describe('ProductCard', () => {
  it('PCARD-001: muestra datos básicos y botón de agregar cuando hay stock', () => {
    const { product } = setup();

    // Nombre y descripción
    expect(screen.getByText(product.NomProducto)).toBeInTheDocument();
    expect(screen.getByText(product.Descripcion!)).toBeInTheDocument();

    // Marca y stock
    expect(screen.getByText(/Marca:/i)).toHaveTextContent('Marca: Marca X');
    expect(
      screen.getByText(/Stock disponible:/i),
    ).toHaveTextContent(`Stock disponible: ${product.Stock}`);

    // Precio unitario y mayorista (formateados)
    expect(mockedFormatPrice).toHaveBeenCalledWith(product.PrecioUnitario);
    expect(mockedFormatPrice).toHaveBeenCalledWith(product.PrecioMayor);
    expect(screen.getByText(/Precio mayor:/i)).toBeInTheDocument();

    // Badge de categoría
    expect(mockedGetCategoryBadge).toHaveBeenCalled();
    expect(screen.getByText('TEST BADGE')).toBeInTheDocument();

    // Botón Agregar al carrito habilitado
    const addButton = screen.getByRole('button', { name: /Agregar al carrito/i });
    expect(addButton).toBeEnabled();
  });

  it('PCARD-002: al hacer clic en la imagen llama a onProductClick con el producto', () => {
    const { product, props } = setup();

    // Imagen mockeada => alt = nombre del producto
    const image = screen.getByAltText(product.NomProducto!);
    fireEvent.click(image);

    expect(props.onProductClick).toHaveBeenCalledTimes(1);
    expect(props.onProductClick).toHaveBeenCalledWith(product);
  });

  it('PCARD-003: botón de favorito usa aria-label y llama a onToggleFavorite', () => {
    const { props } = setup({}, { isFavorite: false });

    const favButton = screen.getByRole('button', { name: /Agregar a favoritos/i });
    fireEvent.click(favButton);

    expect(props.onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(props.onToggleFavorite).toHaveBeenCalledWith('P1');
  });

  it('PCARD-004: muestra badge de “Productos Disponibles” cuando stock es bajo y mayor que 0', () => {
    const { product } = setup({ Stock: 3 });

    expect(
      screen.getByText(`Productos Disponibles: ${product.Stock}`),
    ).toBeInTheDocument();
  });

  it('PCARD-005: cuando stock es 0 muestra “Producto Agotado” y botón deshabilitado con texto “Sin stock”', () => {
    setup({ Stock: 0 });

    expect(screen.getByText(/Producto Agotado/i)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Sin stock/i });
    expect(button).toBeDisabled();
  });

  it('PCARD-006: no muestra “Precio mayor” cuando es igual al precio unitario', () => {
    setup({ PrecioMayor: baseProduct.PrecioUnitario });

    expect(
      screen.queryByText(/Precio mayor:/i),
    ).not.toBeInTheDocument();
  });

  it('PCARD-007: muestra placeholder de imagen cuando no hay URL de imagen', () => {
    setup({ Imagen: undefined });

    expect(screen.getByText(/Vista no Disponible/i)).toBeInTheDocument();
  });
});
