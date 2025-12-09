// components/home/testimonials-section.test.tsx
import React from "react"
import { render, screen } from "@testing-library/react"
import { TestimonialsSection } from "./testimonials-section"

describe("TestimonialsSection", () => {
  it("TESTI-001: muestra el título y la descripción principal", () => {
    render(<TestimonialsSection />)

    expect(screen.getByText(/Nuestros Clientes/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Empresas que confían en nuestro sistema de distribución de material de escritorio/i),
    ).toBeInTheDocument()
  })

  it("TESTI-002: renderiza todas las tarjetas de testimonios con empresa y sector", () => {
    render(<TestimonialsSection />)

    const companies = ["Acme Corp", "Global Inc", "Tech Solutions", "Mega Enterprises"]
    const sectors = ["Sector Tecnológico", "Sector Financiero", "Sector Consultoría", "Sector Retail"]

    companies.forEach((company) => {
      expect(screen.getByText(company)).toBeInTheDocument()
    })

    sectors.forEach((sector) => {
      expect(screen.getByText(sector)).toBeInTheDocument()
    })

    // 4 tarjetas (cada una es un div con clases específicas)
    const cards = document.querySelectorAll(".bg-white.p-6.rounded-lg.shadow-sm")
    expect(cards).toHaveLength(4)
  })

  it("TESTI-003: muestra las iniciales y textos de testimonio de cada cliente", () => {
    render(<TestimonialsSection />)

    const initials = ["AC", "GI", "TS", "ME"]
    initials.forEach((initial) => {
      expect(screen.getByText(initial)).toBeInTheDocument()
    })

    // Probamos fragmentos de los testimonios para evitar problemas con comillas
    expect(
      screen.getByText(/ha mejorado significativamente nuestra gestión de inventario de oficina/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Hemos reducido costos y optimizado nuestros procesos de compra/i)).toBeInTheDocument()
    expect(screen.getByText(/plataforma digital es intuitiva/i)).toBeInTheDocument()
    expect(screen.getByText(/servicio de distribución es puntual/i)).toBeInTheDocument()
  })
})

