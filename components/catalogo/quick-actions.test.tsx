import { render, screen } from '@testing-library/react';
import { QuickActions } from './quick-actions';

// Mock simple de next/link para Jest (si ya tienes un mock global, puedes omitir esto)
jest.mock('next/link', () => (props: any) => {
  const { href, children } = props;
  return <a href={href}>{children}</a>;
});

describe('QuickActions', () => {
  it('QA-001: muestra el título y los 5 botones de accesos rápidos', () => {
    render(<QuickActions />);

    // Título
    expect(
      screen.getByText(/Accesos Rápidos/i),
    ).toBeInTheDocument();

    // Botones por texto
    expect(screen.getByRole('button', { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conocer más/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Solicitar Cotización/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Solicitar demostración/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Contactar ahora/i }),
    ).toBeInTheDocument();

    // En total deben ser 5 botones
    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(5);
  });

  it('QA-002: el acceso rápido "Inicio" navega a la ruta raíz "/"', () => {
    render(<QuickActions />);

    // Nuestro mock de next/link renderiza un <a> que envuelve al botón
    const homeLink = screen.getByRole('link', { name: /Inicio/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('QA-003: existe la acción principal "Solicitar Cotización" como botón habilitado', () => {
    render(<QuickActions />);

    const cotButton = screen.getByRole('button', {
      name: /Solicitar Cotización/i,
    });

    expect(cotButton).toBeInTheDocument();
    expect(cotButton).toBeEnabled();
  });
});
