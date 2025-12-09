// components/home/hero-section.test.tsx
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { HeroSection } from "./hero-section"

// Si ya tienes el mock global de next/image en jest.setup, no hace falta esto.
// Lo dejo comentado por si lo necesitas en otro momento.
// jest.mock("next/image", () => (props: any) => <img {...props} alt={props.alt} />)

describe("HeroSection", () => {
  it("HERO-001: renderiza título, descripción y botones principales", () => {
    render(<HeroSection />)

    // título
    expect(
      screen.getByText(/Distribución Eficiente de Material de Oficina/i),
    ).toBeInTheDocument()

    // descripción
    expect(
      screen.getByText(
        /Optimice su cadena de suministro con nuestro sistema integral/i,
      ),
    ).toBeInTheDocument()

    // botón Conocer más
    expect(
      screen.getByRole("button", { name: /Conocer más/i }),
    ).toBeInTheDocument()

    // botón Ver catálogo
    expect(
      screen.getByRole("button", { name: /Ver catálogo/i }),
    ).toBeInTheDocument()
  })

  it("HERO-002: al hacer clic en 'Conocer más' se abre el diálogo con la información", () => {
    render(<HeroSection />)

    const conocerMasBtn = screen.getByRole("button", { name: /Conocer más/i })
    fireEvent.click(conocerMasBtn)

    // Título del diálogo
    expect(
      screen.getByText(/Nuestro Sistema de Distribución/i),
    ).toBeInTheDocument()

    // Descripción del diálogo
    expect(
      screen.getByText(
        /Descubra cómo podemos transformar la gestión de material de oficina en su empresa/i,
      ),
    ).toBeInTheDocument()

    // Alguna característica dentro del modal
    expect(screen.getByText(/Control Total/i)).toBeInTheDocument()
    expect(screen.getByText(/Entregas Programadas/i)).toBeInTheDocument()
  })

  it("HERO-003: el botón 'Ver catálogo' navega a la ruta correcta", () => {
    render(<HeroSection />)

    // El Link envuelve al botón, así que el rol es 'link' con ese nombre accesible
    const catalogLink = screen.getByRole("link", { name: /Ver catálogo/i })
    expect(catalogLink).toBeInTheDocument()
    expect(catalogLink).toHaveAttribute("href", "/catalogo")
  })

  it("HERO-004: muestra los beneficios principales en el modal", () => {
    render(<HeroSection />)

    // Abrimos el modal
    fireEvent.click(screen.getByRole("button", { name: /Conocer más/i }))

    // Beneficios listados
    expect(
      screen.getByText(/Reducción de costos operativos hasta 30%/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Eliminación de faltantes de material/i),
    ).toBeInTheDocument()
  })
})
