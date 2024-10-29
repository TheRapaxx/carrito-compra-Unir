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

            // Obtener el contenido como JSON
            const data = await response.json();

            // Asegúrate de que estás accediendo a la propiedad correcta
            if (data && data.products) {
                this.productos = data.products.map(producto => ({
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
            this.renderizarDetalles(); // Renderiza los detalles de los productos en el carrito

            // Restablecer el contador a 0
            const input = document.getElementById(producto.sku);
            input.value = 0; // Restablecer contador
        } else {
            console.error('Producto no encontrado');
        }
    }

    actualizarUnidades(sku, unidades) {
        const producto = this.productos.find(item => item.sku === sku);
        if (producto) {
            producto.quantity = unidades;
            this.actualizarTotal(); // Actualiza el total después de cambiar la cantidad
            this.renderizarDetalles(); // Actualiza los detalles
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
        totalElement.innerText = `Total: ${total.toFixed(2)} €`; // Muestra el total en el formato correcto
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

    agregarNuevoProducto(title, precio) {
        const newSKU = `SKU${this.productos.length + 1}`; // Genera un nuevo SKU
        const nuevoProducto = {
            sku: newSKU,
            title: title,
            precio: parseFloat(precio),
            quantity: 0
        };
        this.productos.push(nuevoProducto);
        this.renderizarProductos(); // Actualiza la vista para incluir el nuevo producto
        this.actualizarTotal(); // Actualiza el total
    }

    renderizarDetalles() {
        const detallesContainer = document.getElementById('detalles');
        detallesContainer.innerHTML = ''; // Limpiar contenedor

        this.productos.forEach(producto => {
            if (producto.quantity > 0) {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>${producto.title} - ${producto.quantity} x ${producto.precio.toFixed(2)} € 
                    <button onclick="carrito.eliminarProducto('${producto.sku}')">Eliminar</button></p>
                `;
                detallesContainer.appendChild(div);
            }
        });
    }

    eliminarProducto(sku) {
        const producto = this.productos.find(item => item.sku === sku);
        if (producto) {
            producto.quantity = 0; // Restablecer la cantidad a 0
            this.actualizarTotal(); // Actualizar el total después de eliminar el producto
            this.renderizarDetalles(); // Renderizar los detalles actualizados
        }
    }
}

// Ejemplo de uso
const carrito = new Carrito();
const apiUrl = 'productos.json'; // URL del archivo JSON

// Cargar productos desde la API
carrito.cargarProductosDesdeAPI(apiUrl);

// Manejo del formulario para añadir nuevos productos
document.getElementById('addProductButton').addEventListener('click', () => {
    const title = document.getElementById('newProductTitle').value;
    const price = document.getElementById('newProductPrice').value;

    if (title && price) {
        carrito.agregarNuevoProducto(title, price);
        document.getElementById('newProductTitle').value = ''; // Limpiar el campo
        document.getElementById('newProductPrice').value = ''; // Limpiar el campo
    } else {
        alert('Por favor, complete todos los campos.');
    }
});
