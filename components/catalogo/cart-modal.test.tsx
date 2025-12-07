import { render, fireEvent, waitFor } from '@testing-library/react';
import { CartModal } from './cart-modal';
import type { CartItem } from '@/types/product';

const createMockItem = (overrides: Partial<CartItem> = {}): CartItem =>
  ({
    product: {
      idProd: 'P1',
      NomProducto: 'Producto 1',
      PrecioUnitario: 10,
      Stock: 5,
      Imagen: null,
      ...(overrides as any).product,
    },
    quantity: 2,
    ...overrides,
  } as unknown as CartItem);

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  cartItems: [] as CartItem[],
  onUpdateQuantity: jest.fn(),
  onRemoveItem: jest.fn(),
  onSubmitOrder: jest.fn().mockResolvedValue(true),
  totalPrice: 0,
  loading: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// 🔔 mock de alert para no romper los tests
beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  (window.alert as jest.Mock).mockRestore?.();
});

describe('CartModal', () => {
  it('CART-001: muestra mensajes de carrito vacío y deshabilita el botón continuar', () => {
    const { getByText, getByRole } = render(<CartModal {...baseProps} />);

    expect(getByText(/No hay productos en el carrito/i)).toBeInTheDocument();
    expect(getByText(/El carrito está vacío/i)).toBeInTheDocument();

    const continueButton = getByRole('button', {
      name: /Continuar con la solicitud/i,
    });
    expect(continueButton).toBeDisabled();
  });

  it('CART-002: con productos muestra el resumen y permite pasar a la info de cliente', () => {
    const props = {
      ...baseProps,
      cartItems: [createMockItem()],
      totalPrice: 20,
    };

    const { getByText, getByRole } = render(<CartModal {...props} />);

// se ve el resumen con el producto
expect(getByText(/Producto 1 x2/i)).toBeInTheDocument();
expect(getByText(/Total/i)).toBeInTheDocument();

    const continueButton = getByRole('button', {
      name: /Continuar con la solicitud/i,
    });
    expect(continueButton).not.toBeDisabled();

    // al hacer click cambia al paso "Información del Cliente"
    fireEvent.click(continueButton);

    expect(
      getByText(/Información de contacto/i)
    ).toBeInTheDocument();
  });

  it('CART-003: envía la solicitud cuando el formulario de cliente es válido', async () => {
    const onSubmitOrder = jest.fn().mockResolvedValue(true);
    const onClose = jest.fn();

    const props = {
      ...baseProps,
      cartItems: [createMockItem()],
      totalPrice: 20,
      onSubmitOrder,
      onClose,
    };

    const { getByRole, getByLabelText } = render(<CartModal {...props} />);

    // paso 1: ir a la pantalla de cliente
    fireEvent.click(
      getByRole('button', { name: /Continuar con la solicitud/i })
    );

    // completar formulario
    fireEvent.change(
      getByLabelText(/Nombre completo/i),
      { target: { value: 'Juan Pérez' } }
    );
    fireEvent.change(
      getByLabelText(/Email/i),
      { target: { value: 'juan@example.com' } }
    );
    fireEvent.change(
      getByLabelText(/Teléfono/i),
      { target: { value: '70000000' } }
    );
    fireEvent.change(
      getByLabelText(/Mensaje adicional/i),
      { target: { value: 'Mensaje de prueba' } }
    );

    // enviar
    fireEvent.click(
      getByRole('button', { name: /Enviar solicitud/i })
    );

    await waitFor(() => {
      expect(onSubmitOrder).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitOrder).toHaveBeenCalledWith(
      {
        Nombre: 'Juan Pérez',
        Telefono: '70000000',
        Email: 'juan@example.com',
      },
      'Mensaje de prueba'
    );

    expect(onClose).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Solicitud enviada')
    );
  });
});
