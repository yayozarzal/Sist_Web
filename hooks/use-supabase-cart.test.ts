// hooks/use-supabase-cart.test.ts
import { renderHook, act } from "@testing-library/react"
import { useSupabaseCart } from "./use-supabase-cart"
import { supabase } from "@/lib/supabase"

// --- Mock de supabase --- //
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockedSupabase = supabase as unknown as {
  from: jest.Mock
}

describe("useSupabaseCart (hook)", () => {
  const sampleProduct = {
    idProd: "prod_1",
    NomProducto: "Producto 1",
    PrecioUnitario: 100,
    Stock: 10,
  } as any

  const anotherProduct = {
    idProd: "prod_2",
    NomProducto: "Producto 2",
    PrecioUnitario: 50,
    Stock: 5,
  } as any

  const clienteData = {
    Nombre: "Juan Pérez",
    Telefono: "70000000",
    Email: "juan@example.com",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Helper para configurar supabase con éxito
  const mockSupabaseSuccess = () => {
    const insertClienteMock = jest.fn().mockResolvedValue({ error: null })
    const insertSolicitudMock = jest.fn().mockResolvedValue({ error: null })
    const insertListaMock = jest.fn().mockResolvedValue({ error: null })

    mockedSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case "cliente":
          return { insert: insertClienteMock }
        case "solicitud":
          return { insert: insertSolicitudMock }
        case "listasolicitud":
          return { insert: insertListaMock }
        default:
          return { insert: jest.fn() }
      }
    })

    return { insertClienteMock, insertSolicitudMock, insertListaMock }
  }

  // Helper para configurar supabase con error en cliente
  const mockSupabaseClienteError = () => {
    const error = {
      message: "Fallo inserción cliente",
      code: "500",
      details: "detalle",
    }

    const insertClienteMock = jest.fn().mockResolvedValue({ error })
    const insertSolicitudMock = jest.fn().mockResolvedValue({ error: null })
    const insertListaMock = jest.fn().mockResolvedValue({ error: null })

    mockedSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case "cliente":
          return { insert: insertClienteMock }
        case "solicitud":
          return { insert: insertSolicitudMock }
        case "listasolicitud":
          return { insert: insertListaMock }
        default:
          return { insert: jest.fn() }
      }
    })

    return { insertClienteMock, insertSolicitudMock, insertListaMock }
  }

  it("CART-HOOK-001: estado inicial vacío", () => {
    const { result } = renderHook(() => useSupabaseCart())

    expect(result.current.cartItems).toEqual([])
    expect(result.current.getTotalItems()).toBe(0)
    expect(result.current.getTotalPrice()).toBe(0)
    expect(result.current.loading).toBe(false)
  })

  it("CART-HOOK-002: addToCart agrega productos y acumula cantidad", () => {
    const { result } = renderHook(() => useSupabaseCart())

    act(() => {
      result.current.addToCart(sampleProduct, 1)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(1)

    // mismo producto, suma cantidad
    act(() => {
      result.current.addToCart(sampleProduct, 2)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(3)

    // otro producto
    act(() => {
      result.current.addToCart(anotherProduct, 1)
    })

    expect(result.current.cartItems).toHaveLength(2)
    expect(result.current.getTotalItems()).toBe(4)
    expect(result.current.getTotalPrice()).toBe(100 * 3 + 50 * 1)
  })

   it("CART-HOOK-003: updateCartQuantity actualiza cantidad y elimina si es <= 0", () => {
    const { result } = renderHook(() => useSupabaseCart())

    // 1) agregar productos en acts separados
    act(() => {
      result.current.addToCart(sampleProduct, 2)
    })
    act(() => {
      result.current.addToCart(anotherProduct, 1)
    })

    // 2) actualizar cantidad del prod_1
    act(() => {
      result.current.updateCartQuantity("prod_1", 5)
    })

    expect(
      result.current.cartItems.find((i) => i.product.idProd === "prod_1")?.quantity,
    ).toBe(5)

    // 3) cantidad <= 0 elimina el item
    act(() => {
      result.current.updateCartQuantity("prod_2", 0)
    })

    expect(
      result.current.cartItems.find((i) => i.product.idProd === "prod_2"),
    ).toBeUndefined()
  })

  it("CART-HOOK-004: removeFromCart y clearCart limpian el carrito", () => {
    const { result } = renderHook(() => useSupabaseCart())

    // agregar productos en acts separados
    act(() => {
      result.current.addToCart(sampleProduct, 1)
    })
    act(() => {
      result.current.addToCart(anotherProduct, 1)
    })

    expect(result.current.cartItems).toHaveLength(2)

    // eliminar uno
    act(() => {
      result.current.removeFromCart("prod_1")
    })
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].product.idProd).toBe("prod_2")

    // limpiar todo
    act(() => {
      result.current.clearCart()
    })
    expect(result.current.cartItems).toEqual([])
    expect(result.current.getTotalItems()).toBe(0)
  })

  it("CART-HOOK-004: removeFromCart y clearCart limpian el carrito", () => {
    const { result } = renderHook(() => useSupabaseCart())

    // 1) Agregar un producto al carrito
    act(() => {
      result.current.addToCart(sampleProduct, 2)
    })
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.getTotalItems()).toBe(2)

    // 2) removeFromCart debe dejar el carrito vacío
    act(() => {
      result.current.removeFromCart("prod_1")
    })
    expect(result.current.cartItems).toHaveLength(0)
    expect(result.current.getTotalItems()).toBe(0)

    // 3) Volver a agregar algo y luego usar clearCart
    act(() => {
      result.current.addToCart(anotherProduct, 1)
    })
    expect(result.current.cartItems).toHaveLength(1)

    act(() => {
      result.current.clearCart()
    })
    expect(result.current.cartItems).toEqual([])
    expect(result.current.getTotalItems()).toBe(0)
  })
  it("CART-HOOK-005: submitOrder éxito vacía el carrito y devuelve true", async () => {
    mockSupabaseSuccess()

    const { result } = renderHook(() => useSupabaseCart())

    act(() => {
      result.current.addToCart(sampleProduct, 2)
    })

    let success = false
    await act(async () => {
      success = await result.current.submitOrder(clienteData as any, "Mensaje de prueba")
    })

    expect(success).toBe(true)
    expect(result.current.cartItems).toHaveLength(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.getTotalItems()).toBe(0)

    // se llamaron las tablas esperadas
    expect(mockedSupabase.from).toHaveBeenCalledWith("cliente")
    expect(mockedSupabase.from).toHaveBeenCalledWith("solicitud")
    expect(mockedSupabase.from).toHaveBeenCalledWith("listasolicitud")
  })

  it("CART-HOOK-006: submitOrder error devuelve false y mantiene el carrito", async () => {
    mockSupabaseClienteError()

    const { result } = renderHook(() => useSupabaseCart())

    act(() => {
      result.current.addToCart(sampleProduct, 1)
    })

    let success = true
    await act(async () => {
      success = await result.current.submitOrder(clienteData as any, "Mensaje de prueba")
    })

    expect(success).toBe(false)
    // el carrito NO se vacía
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.getTotalItems()).toBe(1)
    expect(result.current.loading).toBe(false)
  })
})
