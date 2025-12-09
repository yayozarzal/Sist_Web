// components/home/products-section.test.tsx
import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { ProductsSection } from "./products-section"

// Mock simple de next/image para los tests
jest.mock("next/image", () => (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={props.alt} {...props} />
})

describe("ProductsSection", () => {
  it("PRODSEC-001: muestra título, descripción y todas las categorías", () => {
    render(<ProductsSection />)

    // Título principal y descripción
    expect(screen.getByText(/Catálogo de Productos/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Descubra nuestra amplia gama de productos de oficina/i),
    ).toBeInTheDocument()

    // Categorías
    expect(screen.getByText(/Papelería/i)).toBeInTheDocument()
    expect(screen.getByText(/Escritura/i)).toBeInTheDocument()
    expect(screen.getByText(/Organización/i)).toBeInTheDocument()
    expect(screen.getByText(/Accesorios/i)).toBeInTheDocument()

    // Botones "Ver productos" (uno por categoría)
    const buttons = screen.getAllByRole("button", { name: /Ver productos/i })
    expect(buttons).toHaveLength(4)
  })

  it("PRODSEC-002: al hacer clic en 'Ver productos' se abre el diálogo con info de la categoría", () => {
    render(<ProductsSection />)

    // Clic en el primer botón "Ver productos" (Papelería)
    const verProductosButtons = screen.getAllByRole("button", {
      name: /Ver productos/i,
    })
    fireEvent.click(verProductosButtons[0])

    // Dialog abierto
    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // Título y descripción de la categoría seleccionada
    expect(
      within(dialog).getByRole("heading", { name: /Papelería/i }),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Papel, cuadernos, libretas/i),
    ).toBeInTheDocument()

    // Lista de productos de la categoría
    expect(
      within(dialog).getByText(/Papel bond A4 y carta/i),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Cuadernos profesionales/i),
    ).toBeInTheDocument()
  })

  it("PRODSEC-003: el botón 'Cerrar' cierra el diálogo", () => {
    render(<ProductsSection />)

    // Abrir dialog
    const verProductosButtons = screen.getAllByRole("button", {
      name: /Ver productos/i,
    })
    fireEvent.click(verProductosButtons[0])

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // Clic en "Cerrar" dentro del diálogo
    const closeButton = within(dialog).getByRole("button", { name: /Cerrar/i })
    fireEvent.click(closeButton)

    // El diálogo ya no debe estar
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("PRODSEC-004: al hacer clic en 'Cotizar' se llama a window.open con el enlace de WhatsApp", () => {
    const openSpy = jest
      .spyOn(window, "open")
      
      .mockImplementation(() => null)

    render(<ProductsSection />)

    // Abrir dialog de la primera categoría (Papelería)
    const verProductosButtons = screen.getAllByRole("button", {
      name: /Ver productos/i,
    })
    fireEvent.click(verProductosButtons[0])

    const dialog = screen.getByRole("dialog")

    // Clic en "Cotizar" dentro del diálogo
    const quoteButton = within(dialog).getByRole("button", {
      name: /Cotizar/i,
    })
    fireEvent.click(quoteButton)

    expect(openSpy).toHaveBeenCalledTimes(1)

    const [url, target] = openSpy.mock.calls[0]
    expect(typeof url).toBe("string")
    expect(url).toContain("https://wa.me/1234567890")
    expect(url).toContain(
      encodeURIComponent("Hola, me interesa recibir una cotización para productos de la categoría"),
    )
    expect(target).toBe("_blank")

    openSpy.mockRestore()
  })
})

