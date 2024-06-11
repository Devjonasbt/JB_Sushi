const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsModal = document.getElementById('cart-items');
const cartTotalModal = document.getElementById('cart-total');
const checkoutBtnModal = document.getElementById('checkout-btn');
const closeBtnModal = document.getElementById('close-modal-btn');
const addressInputModal = document.getElementById('address');
const addressWarnModal = document.getElementById('address-warn');
const orderDescriptionInput = document.getElementById('order-description');
const cartCounter = document.getElementById('cart-count');

// Lista de itens do carrinho
let cartList = [];

// Verifique a existência dos elementos antes de adicionar eventos
if (cartBtn) {
    cartBtn.addEventListener('click', function () {
        updateCartModal();
        cartModal.style.display = 'flex';
    });
}

if (cartModal) {
    cartModal.addEventListener('click', function (event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
}

if (closeBtnModal) {
    closeBtnModal.addEventListener('click', function () {
        cartModal.style.display = 'none';
    });
}

if (menu) {
    menu.addEventListener('click', function (event) {
        const parentButton = event.target.closest('.add-to-cart-btn');
        if (parentButton) {
            const name = parentButton.getAttribute('data-name');
            const price = parseFloat(parentButton.getAttribute('data-price'));
            addToCart(name, price);
        }
    });
}

function addToCart(name, price) {
    const existingItem = cartList.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartList.push({ name, price, quantity: 1 });
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

    const deliveryFee = 5.00;
    total += deliveryFee;
    cartTotalModal.textContent = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function updateCartCounter() {
    const itemCount = cartList.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.innerHTML = itemCount;
}

if (cartItemsModal) {
    cartItemsModal.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const name = event.target.getAttribute('data-name');
            removeItemCart(name);
        }
    });
}

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

if (addressInputModal) {
    addressInputModal.addEventListener('input', function (event) {
        const inputValue = event.target.value;
        if (inputValue !== '') {
            addressInputModal.classList.remove('border-red-500');
            addressWarnModal.classList.add('hidden');
        }
    });
}

if (checkoutBtnModal) {
    checkoutBtnModal.addEventListener('click', function () {
        if (cartList.length === 0) {
            showToast("Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.", "#ff4e50");
            return;
        }

        const userName = document.getElementById('user-name').value.trim();
        if (userName === '') {
            showToast("Por favor, digite seu nome!", "#ff4e50");
            return;
        }

        if (addressInputModal.value === '') {
            addressWarnModal.classList.remove('hidden');
            addressInputModal.classList.add('border-red-500');
            return;
        }

        let formaPagamento = '';
        const formasPagamento = document.querySelectorAll('input[name="forma_pagamento"]');
        formasPagamento.forEach(opcao => {
            if (opcao.checked) {
                formaPagamento = opcao.value;
            }
        });

        if (formaPagamento === '') {
            showToast("Por favor, selecione uma forma de pagamento!", "#ff4e50");
            return;
        }

        if (!checkRestaurantOpen()) {
            showToast("Ops!! Restaurante fechado no momento", "#ef4444");
            return;
        }

        const deliveryFee = 5.00;
        const orderDescription = orderDescriptionInput.value.trim();
        const cartItems = cartList.map(item => `${item.quantity} * ${item.name} - R$${item.price.toFixed(2)}`).join("%0A");
        const address = encodeURIComponent(addressInputModal.value);
        const phone = '5511913620016';
        const total = cartList.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalFormatted = total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const descriptionText = orderDescription ? `%0A%0ADescrição do pedido: ${encodeURIComponent(orderDescription)}` : '';
        const message = `Cliente: ${userName}%0A%0AOla! Aqui esta os detalhes do meu pedido:%0A%0A${cartItems}${descriptionText}%0A%0ASubTotal:${totalFormatted}%0ATaxa de entrega: R$${deliveryFee.toFixed(2)}%0ATotal: R$${(total + deliveryFee).toFixed(2)}%0A%0AForma de pagamento: ${formaPagamento}%0A%0AEndereço de entrega:%0A${address}%0A%0AMuito obrigado!%0A%0A`;

        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

        cartList = [];
        updateCartModal();
        updateCartCounter();
    });
}

function checkRestaurantOpen() {
    return true; // Implementar lógica de verificação do horário de funcionamento aqui se necessário.
}

function showToast(message, color) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "left",
        backgroundColor: color,
    }).showToast();
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
