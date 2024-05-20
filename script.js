const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');

const cartModal = document.getElementById('cart-modal');
const cartItemsModal = document.getElementById('cart-items');
const cartTotalModal = document.getElementById('cart-total');
const checkoutBtnModal = document.getElementById('checkout-btn');
const closeBtnModal = document.getElementById('close-modal-btn');
const addressInputModal = document.getElementById('address');
const addressWarnModal = document.getElementById('address-warn');

const cartCounter = document.getElementById('cart-count');

// Lista de itens do carrinho
let cartList = [];

// Abre o modal do carrinho
cartBtn.addEventListener('click', function () {
    updateCartModal();
    cartModal.style.display = 'flex';
});

// Fecha modal quando clica fora
cartModal.addEventListener('click', function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

closeBtnModal.addEventListener('click', function () {
    cartModal.style.display = 'none';
});

// Recebe o nome, valor e adiciona ao carrinho ao clicar no botão ou no ícone 
menu.addEventListener('click', function (event) {
    let parentButton = event.target.closest('.add-to-cart-btn');

    if (parentButton) {
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price'));

        // Adicionando no carrinho
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cartList.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartList.push({
            name,
            price,
            quantity: 1,
        });
    }

    updateCartModal();
    updateCartCounter();
}

function updateCartModal() {
    cartItemsModal.innerHTML = '';
    let total = 0;

    cartList.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('flex', 'justify-between', 'mb-2', 'flex-col');

        cartItemElement.innerHTML = `
            <div class='flex items-center justify-between'>
                <div>
                    <p class='font-medium'>${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class='font-medium mt-2'>R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}"> 
                    Remover
                </button>
            </div>
        `;
        total += item.price * item.quantity;

        cartItemsModal.appendChild(cartItemElement);
    });

    cartTotalModal.textContent = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function updateCartCounter() {
    const itemCount = cartList.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.innerHTML = itemCount;
}

cartItemsModal.addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const name = event.target.getAttribute('data-name');

        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cartList.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cartList[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cartList.splice(index, 1);
        }
        updateCartModal();
        updateCartCounter();
    }
}

addressInputModal.addEventListener('input', function (event) {
    let inputValue = event.target.value;

    if (inputValue !== '') {
        addressInputModal.classList.remove('border-red-500');
        addressWarnModal.classList.add('hidden');
    }
});

// Finalizar pedido
checkoutBtnModal.addEventListener('click', function () {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops!! restaurante fechado no momento",
            duration: 3000,
            destination: "https://github.com/Devjonasbt/JB_Sushi.git",
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if (cartList.length === 0) return;

    if (addressInputModal.value === '') {
        addressWarnModal.classList.remove('hidden');
        addressInputModal.classList.add('border-red-500');
        return;
    }

    // Enviar o pedido para API WhatsApp
    const cartItems = cartList.map((item) => {
        return `(${item.quantity}) ${item.name} - Preço: R$${item.price}`;
    }).join("%0A");

    const address = encodeURIComponent(addressInputModal.value);
    const phone = '1188201237';
    const total = cartList.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalFormatted = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const message = `Olá! Aqui estão os detalhes do meu pedido:%0A%0A${cartItems}%0A%0ATotal: ${totalFormatted}%0A%0AEndereço: ${address}%0A%0AMuito obrigado!`;

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    cartList = [];
    updateCartModal();
    updateCartCounter();
});

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();

    return hora >= 18 && hora < 22;
}

const spanItem = document.getElementById('date-span');
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove('bg-red-500');
    spanItem.classList.add('bg-green-600');
} else {
    spanItem.classList.remove('bg-green-600');
    spanItem.classList.add('bg-red-500');
}
