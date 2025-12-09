// components/home/services-section.test.tsx
import React from "react"
import { render, screen } from "@testing-library/react"
import { ServicesSection } from "./services-section"

describe("ServicesSection", () => {
  it("SERV-001: muestra el título y la descripción principal", () => {
    render(<ServicesSection />)

    expect(screen.getByText(/Nuestros Servicios/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /Ofrecemos soluciones completas para la gestión y distribución de material de escritorio/i,
      ),
    ).toBeInTheDocument()
  })

  it("SERV-002: renderiza todas las tarjetas de servicio con sus nombres", () => {
    render(<ServicesSection />)

    const serviceNames = [
      "Material de Escritura",
      "Papelería",
      "Organización",
      "Distribución",
      "Soporte",
    ]

    // Cada nombre debe aparecer exactamente una vez
    serviceNames.forEach((name) => {
      const element = screen.getByText(name)
      expect(element).toBeInTheDocument()
    })

    // Deben existir 5 items en la grilla
    const renderedServices = screen.getAllByText(/Material de Escritura|Papelería|Organización|Distribución|Soporte/)
    expect(renderedServices.length).toBeGreaterThanOrEqual(5)
  })

  it("SERV-003: muestra un icono para cada servicio", () => {
    render(<ServicesSection />)

    // Cada servicio tiene un contenedor con clases específicas
    const iconWrappers = document.querySelectorAll(".bg-gray-100.p-4.rounded-full")
    expect(iconWrappers).toHaveLength(5)
  })
})
