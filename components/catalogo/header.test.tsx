import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './header';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationCenter } from '@/components/notifications/notification-center';

// --- Mocks --- //
jest.mock('@/hooks/use-notifications', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('@/components/notifications/notification-center', () => ({
  NotificationCenter: jest.fn(({ notifications }: any) => (
    <div data-testid="notification-center">Notificaciones: {notifications.length}</div>
  )),
}));

const mockedUseNotifications = useNotifications as jest.Mock;
const mockedNotificationCenter = NotificationCenter as jest.Mock;

const baseNotifications = [
  { id: 'n1', title: 'Notif 1', message: 'Mensaje 1', type: 'info' },
  { id: 'n2', title: 'Notif 2', message: 'Mensaje 2', type: 'info' },
];

const setup = (overrideProps: Partial<React.ComponentProps<typeof Header>> = {}) => {
  const props: React.ComponentProps<typeof Header> = {
    searchTerm: '',
    onSearchChange: jest.fn(),
    totalItems: 0,
    onCartClick: jest.fn(),
    onFiltersClick: jest.fn(),
    onSidebarToggle: jest.fn(),
    showSidebar: false,
    ...overrideProps,
  };

  mockedUseNotifications.mockReturnValue({
    notifications: baseNotifications,
    markAsRead: jest.fn(),
    dismissBanner: jest.fn(),
  });

  mockedNotificationCenter.mockClear();

  const utils = render(<Header {...props} />);
  return { props, ...utils };
};

describe('Header', () => {
  it('HDR-001: renderiza título, subtítulo y buscadores desktop/móvil', () => {
    setup({ searchTerm: 'lapiz' });

    expect(
      screen.getByRole('heading', { name: /Catálogo de Productos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explore nuestra selección de productos/i),
    ).toBeInTheDocument();

    // Hay dos inputs con el mismo placeholder (desktop y móvil)
    const searchInputs = screen.getAllByPlaceholderText(/Buscar productos/i);
    expect(searchInputs).toHaveLength(2);
  });

  it('HDR-002: al escribir en el buscador dispara onSearchChange', () => {
    const { props } = setup();

    const searchInputs = screen.getAllByPlaceholderText(/Buscar productos/i);
    const desktopSearch = searchInputs[0];

    fireEvent.change(desktopSearch, { target: { value: 'cuaderno' } });

    expect(props.onSearchChange).toHaveBeenCalledWith('cuaderno');
  });

  it('HDR-003: muestra badge con totalItems y dispara onCartClick', () => {
    const { props } = setup({ totalItems: 5 });

    // Badge con el número 5
    const badge = screen.getByText('5');
    // El botón del carrito es el ancestro del badge
    const cartButton = badge.closest('button');
    expect(cartButton).toBeInTheDocument();

    fireEvent.click(cartButton!);
    expect(props.onCartClick).toHaveBeenCalled();
  });

  it('HDR-004: el botón de sidebar usa aria-label correcto según showSidebar', () => {
    // Caso 1: sidebar cerrado
    let { props, rerender } = setup({ showSidebar: false });

    const openButton = screen.getByRole('button', {
      name: /Abrir menú lateral/i,
    });
    expect(openButton).toBeInTheDocument();

    fireEvent.click(openButton);
    expect(props.onSidebarToggle).toHaveBeenCalled();

    // Caso 2: sidebar abierto
    ({ props, rerender } = setup({ showSidebar: true }));
    const closeButton = screen.getByRole('button', {
      name: /Cerrar menú lateral/i,
    });
    expect(closeButton).toBeInTheDocument();
  });

  it('HDR-005: pasa las notificaciones al NotificationCenter', () => {
    setup();

    expect(NotificationCenter).toHaveBeenCalled();
    const firstCallProps = mockedNotificationCenter.mock.calls[0][0];

    expect(firstCallProps.notifications).toEqual(baseNotifications);
    expect(firstCallProps.onMarkAsRead).toEqual(expect.any(Function));
    expect(firstCallProps.onDismiss).toEqual(expect.any(Function));

    // Además debería renderizar nuestro stub
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
  });
});
