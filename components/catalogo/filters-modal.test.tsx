import { render, fireEvent } from '@testing-library/react';
import { FiltersModal } from './filters-modal';
import type { FilterState, Category } from '@/types/product';

// Mock de formatPrice para que el texto sea predecible
jest.mock('@/utils/product-helpers', () => ({
  formatPrice: (value: number) => `$${value}`,
}));

// Mock del Slider para poder cambiar el rango con un input simple
jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, max, min, step }: any) => (
    <input
      type="range"
      data-testid="price-slider"
      min={min}
      max={max}
      step={step}
      value={value[1]}
      onChange={(e) => {
        const newMax = Number(e.target.value);
        onValueChange([value[0], newMax]);
      }}
    />
  ),
}));

const baseFilters: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, 100],
} as any;

const categories: Category[] = [
  { idCategoria: 1, NomCategoria: 'Papelería' } as any,
  { idCategoria: 2, NomCategoria: 'Escritura' } as any,
];

const brands = ['BIC', 'Faber-Castell'];

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  filters: baseFilters,
  onFiltersChange: jest.fn(),
  onApplyFilters: jest.fn(),
  onClearFilters: jest.fn(),
  categories,
  brands,
  maxPrice: 200,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// Opcional: silenciar warnings de Radix Dialog
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  (console.warn as jest.Mock).mockRestore?.();
});

describe('FiltersModal', () => {
  it('FMOD-001: muestra categorías, marcas y rango de precios cuando está abierto', () => {
    const { getByRole, getByText } = render(<FiltersModal {...baseProps} />);

    // Usamos rol "heading" para evitar el problema de textos duplicados
    expect(getByRole('heading', { name: /Filtros/i })).toBeInTheDocument();
    expect(
      getByText(/Filtre los productos por categoría, marca y precio/i),
    ).toBeInTheDocument();

    // Categorías
    expect(getByText(/Papelería/i)).toBeInTheDocument();
    expect(getByText(/Escritura/i)).toBeInTheDocument();

    // Marcas
    expect(getByText(/BIC/i)).toBeInTheDocument();
    expect(getByText(/Faber-Castell/i)).toBeInTheDocument();

    // Rango de precios formateado (mock formatPrice => $valor)
    expect(getByText('$0')).toBeInTheDocument();
    expect(getByText('$100')).toBeInTheDocument();
  });

  it('FMOD-002: al marcar una categoría se llama onFiltersChange agregando su id', () => {
    const onFiltersChange = jest.fn();

    const { getByLabelText } = render(
      <FiltersModal
        {...baseProps}
        filters={{ ...baseFilters, categories: [] } as any}
        onFiltersChange={onFiltersChange}
      />,
    );

    const checkbox = getByLabelText('Papelería'); // Label asociado al checkbox

    fireEvent.click(checkbox);

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...baseFilters,
      categories: [1],
    });
  });

  it('FMOD-003: al cambiar el rango de precios se llama onFiltersChange con el nuevo max', () => {
    const onFiltersChange = jest.fn();

    const { getByTestId } = render(
      <FiltersModal
        {...baseProps}
        filters={{ ...baseFilters, priceRange: [0, 100] } as any}
        onFiltersChange={onFiltersChange}
      />,
    );

    const slider = getByTestId('price-slider');

    // Cambiamos el valor máximo de 100 a 150
    fireEvent.change(slider, { target: { value: '150' } });

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...baseFilters,
      priceRange: [0, 150],
    });
  });

  it('FMOD-004: botones "Limpiar filtros" y "Aplicar filtros" llaman a sus callbacks', () => {
    const onApplyFilters = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText } = render(
      <FiltersModal
        {...baseProps}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
      />,
    );

    fireEvent.click(getByText(/Limpiar filtros/i));
    fireEvent.click(getByText(/Aplicar filtros/i));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledTimes(1);
  });
});
