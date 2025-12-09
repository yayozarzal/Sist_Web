// components/home/features-section.test.tsx
import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { FeaturesSection } from "./features-section"

describe("FeaturesSection", () => {
  it("FEAT-001: renderiza título y lista de características", () => {
    render(<FeaturesSection />)

    // Título principal
    expect(
      screen.getByText(/Sistema de Gestión Integral/i),
    ).toBeInTheDocument()

    // Características
    expect(
      screen.getByText(/Control de inventario en tiempo real/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Entregas programadas según las necesidades de su empresa/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Reportes detallados de consumo y proyecciones de demanda/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Plataforma digital para realizar pedidos de forma sencilla/i),
    ).toBeInTheDocument()

    // Botón que abre el modal
    expect(
      screen.getByRole("button", { name: /Solicitar demostración/i }),
    ).toBeInTheDocument()
  })

  it("FEAT-002: al hacer clic en 'Solicitar demostración' se abre el diálogo", () => {
    render(<FeaturesSection />)

    const openBtn = screen.getByRole("button", {
      name: /Solicitar demostración/i,
    })
    fireEvent.click(openBtn)

    // Existe el dialog
    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()

    // Título y descripción dentro del diálogo
    expect(
      within(dialog).getByRole("heading", { name: /Solicitar Demostración/i }),
    ).toBeInTheDocument()

    expect(
      within(dialog).getByText(
        /Complete el formulario y le mostraremos cómo funciona nuestro sistema/i,
      ),
    ).toBeInTheDocument()
  })

  it("FEAT-003: el formulario del modal muestra todos los campos principales", () => {
    render(<FeaturesSection />)

    // Abrir modal
    const openBtn = screen.getByRole("button", {
      name: /Solicitar demostración/i,
    })
    fireEvent.click(openBtn)

    const dialog = screen.getByRole("dialog")

    // Campos dentro del dialog
    expect(within(dialog).getByLabelText(/Empresa/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Nombre completo/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/^Email$/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Teléfono/i)).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Número de empleados/i),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByLabelText(/Mensaje adicional/i),
    ).toBeInTheDocument()

    // Botón de enviar dentro del dialog
    expect(
      within(dialog).getByRole("button", {
        name: /Solicitar demostración/i,
      }),
    ).toBeInTheDocument()
  })

  it("FEAT-004: al enviar el formulario se llama a alert y se cierra el modal", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {})

    render(<FeaturesSection />)

    // Abrir modal
    const openBtn = screen.getByRole("button", {
      name: /Solicitar demostración/i,
    })
    fireEvent.click(openBtn)

    const dialog = screen.getByRole("dialog")

    // Rellenar campos requeridos
    fireEvent.change(within(dialog).getByLabelText(/Empresa/i), {
      target: { value: "Empresa Test" },
    })
    fireEvent.change(within(dialog).getByLabelText(/Nombre completo/i), {
      target: { value: "Usuario Demo" },
    })
    fireEvent.change(within(dialog).getByLabelText(/^Email$/i), {
      target: { value: "demo@test.com" },
    })
    fireEvent.change(within(dialog).getByLabelText(/Teléfono/i), {
      target: { value: "70000000" },
    })

    // Botón submit dentro del diálogo
    const submitBtn = within(dialog).getByRole("button", {
      name: /Solicitar demostración/i,
    })
    fireEvent.click(submitBtn)

    expect(alertSpy).toHaveBeenCalledWith(
      "Solicitud de demostración enviada. Nos contactaremos pronto.",
    )

    // El diálogo debe haberse cerrado (el botón externo sigue existiendo)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    alertSpy.mockRestore()
  })
})
