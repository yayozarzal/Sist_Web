import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './sidebar';
import type { Product } from '@/types/product';

const baseProducts: Product[] = [
  {
    idProd: 'P1',
    NomProducto: 'Lapicero Azul',
    Descripcion: 'Lapicero de tinta azul',
    PrecioUnitario: 2,
    Stock: 10,
    marca: 'BIC',
    Estado: true,
  } as any,
  {
    idProd: 'P2',
    NomProducto: 'Cuaderno rayado',
    Descripcion: 'Cuaderno universitario',
    PrecioUnitario: 8,
    Stock: 5,
    marca: 'Standford',
    Estado: false,
  } as any,
];

const favoriteProducts: Product[] = [
  {
    idProd: 'P2',
    NomProducto: 'Cuaderno rayado',
    Descripcion: 'Cuaderno universitario',
    PrecioUnitario: 8,
    Stock: 5,
    marca: 'Standford',
    Estado: true,
  } as any,
];

const setup = (override: Partial<React.ComponentProps<typeof Sidebar>> = {}) => {
  const defaultProps: React.ComponentProps<typeof Sidebar> = {
    products: baseProducts,
    favoriteProducts,
    showSidebar: true,
    isProductListExpanded: true,
    isFavoritesExpanded: true,
    onProductListToggle: jest.fn(),
    onFavoritesToggle: jest.fn(),
    onToggleFavorite: jest.fn(),
    onProductSelect: jest.fn(),
  };

  const props = { ...defaultProps, ...override };

  const utils = render(<Sidebar {...props} />);

  return { props, ...utils };
};

describe('Sidebar', () => {
  it('SID-001: aplica clase visible/oculta según showSidebar (en mobile)', () => {
    const { container } = setup({ showSidebar: true });

    const sidebarDiv = container.firstChild as HTMLElement;
    expect(sidebarDiv.className).toContain('translate-x-0');

    // Segundo caso: oculto
    const { container: container2 } = setup({ showSidebar: false });
    const sidebarDiv2 = container2.firstChild as HTMLElement;
    expect(sidebarDiv2.className).toContain('-translate-x-full');
  });

  it('SID-002: botón "Lista de Productos" llama a onProductListToggle', () => {
    const { props } = setup();

    const button = screen.getByRole('button', { name: /Lista de Productos/i });
    fireEvent.click(button);

    expect(props.onProductListToggle).toHaveBeenCalledTimes(1);
  });

  it('SID-003: botón "Sección de Favoritos" llama a onFavoritesToggle', () => {
    const { props } = setup();

    const button = screen.getByRole('button', { name: /Sección de Favoritos/i });
    fireEvent.click(button);

    expect(props.onFavoritesToggle).toHaveBeenCalledTimes(1);
  });

  it('SID-004: cuando isProductListExpanded es true se listan todos los productos, cuando es false no se muestran', () => {
    // Para evitar el duplicado de "Cuaderno rayado" en favoritos,
    // aquí ponemos favoriteProducts vacío
    const { props, rerender } = setup({
      isProductListExpanded: true,
      favoriteProducts: [],
    });

    // Expandido: se ven los 2 productos
    expect(screen.getByText('Lapicero Azul')).toBeInTheDocument();
    expect(screen.getByText('Cuaderno rayado')).toBeInTheDocument();

    // Colapsado: rerender con la misma config pero isProductListExpanded=false
    rerender(
      <Sidebar
        {...props}
        isProductListExpanded={false}
      />,
    );

    expect(screen.queryByText('Lapicero Azul')).not.toBeInTheDocument();
    expect(screen.queryByText('Cuaderno rayado')).not.toBeInTheDocument();
  });

  it('SID-005: muestra mensaje cuando no hay productos en la lista', () => {
    setup({
      products: [],
      isProductListExpanded: true,
    });

    expect(
      screen.getByText(/No hay productos disponibles/i),
    ).toBeInTheDocument();
  });

  it('SID-006: muestra mensaje cuando no hay productos favoritos', () => {
    setup({
      favoriteProducts: [],
      isFavoritesExpanded: true,
    });

    expect(
      screen.getByText(/No tiene productos favoritos/i),
    ).toBeInTheDocument();
  });

  it('SID-007: en lista de productos, el botón de corazón llama a onToggleFavorite con idProd', () => {
    const { props } = setup({ isProductListExpanded: true });

    // Botón del primer producto: aria-label depende de Estado (true/false)
    const heartButtons = screen.getAllByRole('button', {
      name: /favoritos/i,
    });

    fireEvent.click(heartButtons[0]);

    expect(props.onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(props.onToggleFavorite).toHaveBeenCalledWith('P1');
  });

  it('SID-008: en favoritos, el botón + llama a onProductSelect con el producto correcto', () => {
    // Para evitar duplicados, aquí dejamos SOLO el favorito y sin products
    const { props } = setup({
      products: [],
      favoriteProducts,
      isFavoritesExpanded: true,
      isProductListExpanded: false,
    });

    const plusButton = screen.getByRole('button', {
      name: /Agregar Cuaderno rayado al pedido/i,
    });

    fireEvent.click(plusButton);

    expect(props.onProductSelect).toHaveBeenCalledTimes(1);
    expect(props.onProductSelect).toHaveBeenCalledWith(
      expect.objectContaining({ idProd: 'P2' }),
    );
  });
});
