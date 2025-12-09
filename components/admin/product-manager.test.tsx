// components/admin/product-manager.test.tsx
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ProductManager } from "@/components/admin/product-manager"

// --- Mocks globales ---
// 1) Declaramos primero los jest.fn()
const createBannerMock = jest.fn()
const createNotificationMock = jest.fn()

export const insertMock = jest.fn()
export const fromMock = jest.fn(() => ({ insert: insertMock }))

const alertMock = jest.fn()

// 2) Luego usamos esos mocks en jest.mock
jest.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    createBanner: createBannerMock,
    createNotification: createNotificationMock,
  }),
}))

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (...args: any[]) => fromMock(...args),
  },
}))

describe("ProductManager", () => {
  beforeAll(() => {
    // @ts-ignore
    window.alert = alertMock
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("PMAN-001: renderiza el formulario con campos obligatorios y botón de enviar", () => {
    render(<ProductManager />)

    expect(screen.getByText(/Agregar Nuevo Producto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre del Producto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Marca/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Precio Unitario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Stock/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Producto activo/i)).toBeInTheDocument()

    const submitButton = screen.getByRole("button", { name: /Agregar Producto/i })
    expect(submitButton).toBeEnabled()
  })

  it("PMAN-002: al enviar datos válidos inserta en Supabase, crea banner/notificación y limpia el formulario", async () => {
    insertMock.mockResolvedValue({ error: null })

    render(<ProductManager />)

    fireEvent.change(screen.getByLabelText(/Nombre del Producto/i), {
      target: { value: "Producto Test" },
    })
    fireEvent.change(screen.getByLabelText(/Marca/i), {
      target: { value: "Marca X" },
    })
    fireEvent.change(screen.getByLabelText(/Precio Unitario/i), {
      target: { value: "100" },
    })
    fireEvent.change(screen.getByLabelText(/Stock/i), {
      target: { value: "10" },
    })
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
      target: { value: "Descripción de prueba" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Agregar Producto/i }))

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledTimes(1)
    })

    // se llamó a supabase.from con la tabla correcta
    expect(fromMock).toHaveBeenCalledWith("Producto")

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        NomProducto: "Producto Test",
        Descripcion: "Descripción de prueba",
        PrecioUnitario: 100,
        Stock: 10,
        marca: "Marca X",
      }),
    )

    expect(createBannerMock).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).toHaveBeenCalledTimes(1)
    expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/Producto agregado exitosamente/i))

    expect(screen.getByLabelText(/Nombre del Producto/i)).toHaveValue("")
  })

  it("PMAN-003: si Supabase devuelve error muestra alerta de error y no crea banner/notificación", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    insertMock.mockResolvedValue({
      error: { message: "Fallo inserción", code: "500" },
    } as any)

    render(<ProductManager />)

    fireEvent.change(screen.getByLabelText(/Nombre del Producto/i), {
      target: { value: "Producto Error" },
    })
    fireEvent.change(screen.getByLabelText(/Marca/i), {
      target: { value: "Marca Error" },
    })
    fireEvent.change(screen.getByLabelText(/Precio Unitario/i), {
      target: { value: "50" },
    })
    fireEvent.change(screen.getByLabelText(/Stock/i), {
      target: { value: "5" },
    })
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
      target: { value: "Desc error" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Agregar Producto/i }))

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledTimes(1)
    })

    expect(createBannerMock).not.toHaveBeenCalled()
    expect(createNotificationMock).not.toHaveBeenCalled()
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringMatching(/Error al agregar el producto/i),
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})

