class Carrito {
    constructor() {
        this.productos = [];
    }

    // Cargar productos desde la API
    async cargarProductosDesdeAPI(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }

            // Obtener el contenido como texto
            const data = await response.text();
            
            // Intentar analizar como JSON
            const productosData = JSON.parse(data);

            // Asegúrate de que estás accediendo a la propiedad correcta
            if (productosData && productosData.products) {
                this.productos = productosData.products.map(producto => ({
                    sku: producto.SKU,
                    title: producto.title,
                    precio: parseFloat(producto.price),
                    quantity: 0
                }));

                this.renderizarProductos(); // Renderizar productos al cargar
            } else {
                throw new Error('La propiedad "products" no está definida en la respuesta.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los productos. Verifique la consola para más detalles.');
        }
    }

    agregarProducto(sku) {
        const producto = this.productos.find(item => item.sku === sku);
        if (producto) {
            producto.quantity += 1;
            this.actualizarTotal();
        } else {
            console.error('Producto no encontrado');
        }
    }

    actualizarUnidades(sku, unidades) {
        const producto = this.productos.find(item => item.sku === sku);
        if (producto) {
            producto.quantity = unidades;
            this.actualizarTotal();
        }
    }

    obtenerCarrito() {
        return this.productos;
    }

    actualizarTotal() {
        const totalElement = document.getElementById('total');
        const total = this.productos.reduce((sum, item) => {
            return sum + (item.precio * item.quantity);
        }, 0);
        totalElement.innerText = `Total: ${total.toFixed(2)} €`;
    }

    renderizarProductos() {
        const productosContainer = document.getElementById('productos');
        productosContainer.innerHTML = ''; // Limpiar contenedor

        this.productos.forEach(producto => {
            const div = document.createElement('div');
            div.classList.add('producto');
            div.innerHTML = `
                <h3>${producto.title}</h3>
                <p>Precio: ${producto.precio.toFixed(2)} €</p>
                <input type="number" value="${producto.quantity}" min="0" id="${producto.sku}">
                <button onclick="carrito.agregarProducto('${producto.sku}')">Agregar</button>
            `;
            productosContainer.appendChild(div);

            // Escuchar cambios en el input de unidades
            const input = document.getElementById(producto.sku);
            input.addEventListener('change', (e) => {
                const unidades = parseInt(e.target.value);
                this.actualizarUnidades(producto.sku, isNaN(unidades) ? 0 : unidades);
            });
        });
    }
}

// Ejemplo de uso
const carrito = new Carrito();
const apiUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent('http://jsonblob.com/1300913045424168960'); // URL de la API con el proxy

// Cargar productos desde la API
carrito.cargarProductosDesdeAPI(apiUrl);
