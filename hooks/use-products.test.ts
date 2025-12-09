import { renderHook, act } from "@testing-library/react"
import { useProducts } from "./use-products"

const initialProducts = [
  {
    idProd: "prod_1",
    NomProducto: "Lapicero Azul",
    Descripcion: "Lapicero azul fino",
    idCategoria: 1,
    marca: "Bic",
    PrecioUnitario: 5,
    // campo usado por el hook
    isFavorite: false,
  },
  {
    idProd: "prod_2",
    NomProducto: "Cuaderno rayado",
    Descripcion: "Cuaderno tamaño carta",
    idCategoria: 2,
    marca: "Norma",
    PrecioUnitario: 20,
    isFavorite: true,
  },
]

// helper para no repetir
const setup = () => renderHook(() => useProducts(initialProducts as any))

describe("useProducts (hook)", () => {
  it("UPROD-HOOK-001: inicializa con productos y calcula favoritos correctamente", () => {
    const { result } = setup()

    // productos iniciales
    expect(result.current.products).toHaveLength(2)

    // favoritos (solo el prod_2)
    expect(result.current.favoriteProducts).toHaveLength(1)
    expect(result.current.favoriteProducts[0].idProd).toBe("prod_2")

    // por defecto: tab 'productos' y categoría 'todos'
    expect(result.current.activeTab).toBe("productos")
    expect(result.current.selectedCategory).toBe("todos")
    // filteredProducts inicialmente muestra todos
    expect(result.current.filteredProducts).toHaveLength(2)
  })

  it("UPROD-HOOK-002: aplica búsqueda por texto sobre nombre y descripción", () => {
    const { result } = setup()

    // buscar "lapicero"
    act(() => {
      result.current.setSearchTerm("lapicero")
    })

    expect(result.current.filteredProducts).toHaveLength(1)
    expect(result.current.filteredProducts[0].NomProducto).toBe("Lapicero Azul")

    // buscar por descripción: "tamaño"
    act(() => {
      result.current.setSearchTerm("tamaño")
    })

    expect(result.current.filteredProducts).toHaveLength(1)
    expect(result.current.filteredProducts[0].NomProducto).toBe("Cuaderno rayado")
  })

  it("UPROD-HOOK-003: respeta categoría seleccionada, filtros de marca y rango de precios", () => {
    const { result } = setup()

    // categoría 2 (cuadernos)
    act(() => {
      result.current.setSelectedCategory(2)
    })
    expect(result.current.filteredProducts).toHaveLength(1)
    expect(result.current.filteredProducts[0].NomProducto).toBe("Cuaderno rayado")

    // filtros: marca "Norma" y precio entre 10 y 25
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        brands: ["Norma"],
        priceRange: [10, 25],
      })
    })

    const filtrados = result.current.filteredProducts
    expect(filtrados).toHaveLength(1)
    expect(filtrados[0].NomProducto).toBe("Cuaderno rayado")

    // si cambiamos el rango de precios a [0, 10], ya no entra
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        priceRange: [0, 10],
      })
    })
    expect(result.current.filteredProducts).toHaveLength(0)
  })

  it("UPROD-HOOK-004: toggleFavorite y tab 'favoritos' muestran sólo los marcados", () => {
    const { result } = setup()

    // al inicio, prod_2 es favorito
    act(() => {
      result.current.setActiveTab("favoritos")
    })

    expect(result.current.filteredProducts).toHaveLength(1)
    expect(result.current.filteredProducts[0].idProd).toBe("prod_2")

    // marcar prod_1 como favorito
    act(() => {
      result.current.toggleFavorite("prod_1")
    })

    // ahora deberían aparecer 2 favoritos en filteredProducts
    expect(result.current.filteredProducts.map((p) => p.idProd).sort()).toEqual(
      ["prod_1", "prod_2"].sort(),
    )

    // desmarcar prod_2
    act(() => {
      result.current.toggleFavorite("prod_2")
    })

    const favoritosRestantes = result.current.filteredProducts
    expect(favoritosRestantes).toHaveLength(1)
    expect(favoritosRestantes[0].idProd).toBe("prod_1")
  })
})
