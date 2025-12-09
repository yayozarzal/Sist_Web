import { renderHook, act, waitFor } from "@testing-library/react"
import { useSupabaseProducts } from "./use-supabase-products"
import { supabase } from "@/lib/supabase"

// Mock de supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockSupabaseFrom = supabase.from as jest.Mock

const productosDB = [
  {
    idprod: "prod_1",
    nomproducto: "Lapicero Azul",
    estado: true,
    imagen: null,
    idcategoria: 1,
    stock: 10,
    marca: "Bic",
    descripcion: "Lapicero azul fino",
    preciounitario: 5,
    preciomayor: 4,
    categoria: { idcategoria: 1, nomcategoria: "Escritura" },
  },
  {
    idprod: "prod_2",
    nomproducto: "Cuaderno rayado",
    estado: true,
    imagen: null,
    idcategoria: 2,
    stock: 3,
    marca: "Norma",
    descripcion: "Cuaderno tamaño carta",
    preciounitario: 20,
    preciomayor: 18,
    categoria: { idcategoria: 2, nomcategoria: "Papelería" },
  },
]

const categoriasDB = [
  { idcategoria: 1, nomcategoria: "Escritura" },
  { idcategoria: 2, nomcategoria: "Papelería" },
]

// Helper para mockear respuesta OK de productos + categorías
function mockSupabaseSuccess() {
  mockSupabaseFrom
    // 1ª llamada: from("producto")
    .mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: productosDB, error: null }),
    })
    // 2ª llamada: from("categoria")
    .mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: categoriasDB, error: null }),
    })
}

describe("useSupabaseProducts (hook)", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("PROD-HOOK-001: carga productos y categorías al inicializar sin error", async () => {
    mockSupabaseSuccess()

    const { result } = renderHook(() => useSupabaseProducts())

    // al inicio está cargando
    expect(result.current.loading).toBe(true)

    // esperamos a que termine la carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.products).toHaveLength(2)
    expect(result.current.categories).toHaveLength(2)

    // se formatean correctamente los campos principales
    expect(result.current.products[0]).toMatchObject({
      idProd: "prod_1",
      NomProducto: "Lapicero Azul",
      PrecioUnitario: 5,
      idCategoria: 1,
    })
  })

  it("PROD-HOOK-002: aplica searchTerm y filtros (categoría, marca, precio) sobre filteredProducts", async () => {
    mockSupabaseSuccess()

    const { result } = renderHook(() => useSupabaseProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Sin filtros, muestra los 2
    expect(result.current.filteredProducts).toHaveLength(2)

    // Buscar por texto
    act(() => {
      result.current.setSearchTerm("lapicero")
    })
    expect(result.current.filteredProducts).toHaveLength(1)
    expect(result.current.filteredProducts[0].NomProducto).toBe("Lapicero Azul")

    // Limpiamos búsqueda y aplicamos filtros
    act(() => {
      result.current.setSearchTerm("")
      result.current.setFilters({
        ...result.current.filters,
        categories: [2], // Papelería
        brands: ["Norma"],
        priceRange: [10, 25],
      })
    })

    const filtrados = result.current.filteredProducts
    expect(filtrados).toHaveLength(1)
    expect(filtrados[0].NomProducto).toBe("Cuaderno rayado")
  })

  it("PROD-HOOK-003: toggleFavorite alterna favoritos y el tab 'favoritos' sólo muestra esos productos", async () => {
    mockSupabaseSuccess()

    const { result } = renderHook(() => useSupabaseProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Por defecto, tab 'productos' → se ven los 2
    expect(result.current.activeTab).toBe("productos")
    expect(result.current.filteredProducts).toHaveLength(2)

    // Marcar un favorito
    act(() => {
      result.current.toggleFavorite("prod_2")
    })

    // Cambiar a tab de favoritos
    act(() => {
      result.current.setActiveTab("favoritos")
    })

    const favoritosFiltrados = result.current.filteredProducts
    expect(favoritosFiltrados).toHaveLength(1)
    expect(favoritosFiltrados[0].idProd).toBe("prod_2")

    // Desmarcar favorito
    act(() => {
      result.current.toggleFavorite("prod_2")
    })
    expect(result.current.filteredProducts).toHaveLength(0)
  })

  it("PROD-HOOK-004: cuando Supabase falla en productos, establece mensaje de error", async () => {
    // 1ª llamada (producto) devuelve error
    mockSupabaseFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "fallo productos" } as any,
        }),
      })
      // 2ª llamada (categoría) no importa tanto, pero la mockeamos OK
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: categoriasDB, error: null }),
      })

    const { result } = renderHook(() => useSupabaseProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("Error al cargar productos")
    expect(result.current.products).toHaveLength(0)
  })
})
