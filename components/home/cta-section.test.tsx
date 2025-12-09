// components/home/cta-section.test.tsx
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { CTASection } from "./cta-section"

describe("CTASection", () => {
  let openSpy: jest.SpyInstance

  beforeEach(() => {
    openSpy = jest.spyOn(window, "open").mockImplementation(() => null as any)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it("CTA-001: muestra el título, descripción y botón de contacto", () => {
    render(<CTASection />)

    expect(screen.getByText(/¿Listo para optimizar su distribución\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Contáctenos hoy para una consulta personalizada sobre nuestro sistema/i),
    ).toBeInTheDocument()

    const button = screen.getByRole("button", { name: /Contactar ahora/i })
    expect(button).toBeInTheDocument()
  })

  it("CTA-002: al hacer clic en el botón abre WhatsApp con el mensaje preconfigurado", () => {
    render(<CTASection />)

    const button = screen.getByRole("button", { name: /Contactar ahora/i })

    const phoneNumber = "1234567890"
    const message =
      "Hola, estoy interesado en optimizar la distribución de material de oficina. Me gustaría recibir más información sobre su sistema."
    const expectedUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    fireEvent.click(button)

    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).toHaveBeenCalledWith(expectedUrl, "_blank")
  })
})
