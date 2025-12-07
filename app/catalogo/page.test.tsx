import { render } from '@testing-library/react';
import CatalogoPage from './page';

// ----- MOCKS DE HOOKS DINÁMICOS -----

const mockUseSupabaseCart = jest.fn();
const mockUseSupabaseProducts = jest.fn();
const mockUseNotifications = jest.fn();

jest.mock('@/hooks/use-supabase-cart', () => ({
  useSupabaseCart: () => mockUseSupabaseCart(),
}));

jest.mock('@/hooks/use-supabase-products', () => ({
  useSupabaseProducts: () => mockUseSupabaseProducts(),
}));

jest.mock('@/hooks/use-notifications', () => ({
  useNotifications: () => mockUseNotifications(),
}));

// ----- MOCKS DE COMPONENTES HIJOS -----

jest.mock('@/components/catalogo/header', () => ({
  Header: () => <div data-testid="header">HEADER</div>,
}));

jest.mock('@/components/catalogo/quick-actions', () => ({
  QuickActions: () => <div data-testid="quick-actions">QUICK ACTIONS</div>,
}));

jest.mock('@/components/catalogo/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">SIDEBAR</div>,
}));

jest.mock('@/components/catalogo/product-grid', () => ({
  ProductGrid: () => <div data-testid="product-grid">PRODUCT GRID</div>,
}));

jest.mock('@/components/catalogo/cart-modal', () => ({
  CartModal: () => <div data-testid="cart-modal">CART MODAL</div>,
}));

jest.mock('@/components/catalogo/filters-modal', () => ({
  FiltersModal: () => <div data-testid="filters-modal">FILTERS MODAL</div>,
}));

jest.mock('@/components/catalogo/product-modal', () => ({
  ProductModal: () => <div data-testid="product-modal">PRODUCT MODAL</div>,
}));

jest.mock('@/components/notifications/banner-system', () => ({
  BannerSystem: () => <div data-testid="banner-system">BANNERS</div>,
}));

jest.mock('@/components/notifications/product-alert-card', () => ({
  ProductAlertCard: () => <div data-testid="product-alert-card">ALERT</div>,
}));

jest.mock('@/components/shared/footer', () => ({
  Footer: () => <div data-testid="footer">FOOTER</div>,
}));

// ----- ESTADO BASE PARA LOS HOOKS -----

const baseProductsState = {
  products: [],
  categories: [],
  loading: false,
  error: null as unknown,
  searchTerm: '',
  setSearchTerm: jest.fn(),
  filters: { categories: [], brands: [], priceRange: [0, 10000] },
  setFilters: jest.fn(),
  activeTab: 'all',
  setActiveTab: jest.fn(),
  filteredProducts: [],
  favoriteProducts: [],
  toggleFavorite: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();

  mockUseSupabaseCart.mockReturnValue({
    cartItems: [],
    addToCart: jest.fn(),
    updateCartQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    getTotalPrice: jest.fn(() => 0),
    getTotalItems: jest.fn(() => 0),
    submitOrder: jest.fn(),
    loading: false,
  });

  mockUseSupabaseProducts.mockReturnValue({ ...baseProductsState });

  mockUseNotifications.mockReturnValue({
    banners: [],
    newProductAlerts: [],
    dismissBanner: jest.fn(),
    createNotification: jest.fn(),
  });
});

// ----- TESTS -----

describe('CatalogoPage', () => {
  it('renderiza la estructura principal cuando no hay loading ni error', () => {
    const { getByTestId } = render(<CatalogoPage />);

    expect(getByTestId('header')).toBeInTheDocument();
    expect(getByTestId('quick-actions')).toBeInTheDocument();
    expect(getByTestId('sidebar')).toBeInTheDocument();
    expect(getByTestId('product-grid')).toBeInTheDocument();
    expect(getByTestId('cart-modal')).toBeInTheDocument();
    expect(getByTestId('filters-modal')).toBeInTheDocument();
    expect(getByTestId('product-modal')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
  });

  it('muestra la pantalla de carga cuando loading es true', () => {
    mockUseSupabaseProducts.mockReturnValue({
      ...baseProductsState,
      loading: true,
    });

    const { getByText } = render(<CatalogoPage />);

    expect(getByText(/Cargando productos.../i)).toBeInTheDocument();
  });

  it('muestra la pantalla de error cuando error tiene contenido', () => {
    mockUseSupabaseProducts.mockReturnValue({
      ...baseProductsState,
      error: new Error('Falla al cargar el catálogo'),
    });

    const { getByText } = render(<CatalogoPage />);

    expect(getByText(/Error:/i)).toBeInTheDocument();
    expect(getByText(/Reintentar/i)).toBeInTheDocument();
  });
});
