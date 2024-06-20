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
        // Função para formatar valor monetário sem espaço entre 'R$' e o valor
        function formatCurrency(value) {
            return `R$${value.toFixed(2).replace('.', ',')}`;
        }

        // Dentro do evento checkoutBtnModal.addEventListener('click', function () { ... })
        const totalFormatted = formatCurrency(total);


        const descriptionText = orderDescription ? `%0A%0ADescrição do pedido: ${encodeURIComponent(orderDescription)}` : '';
        const message = `Cliente: ${userName}%0A%0AOla! Aqui esta os detalhes do meu pedido:%0A%0A${cartItems}${descriptionText}%0A%0ASubTotal: ${totalFormatted}%0ATaxa de entrega: R$${deliveryFee.toFixed(2)}%0ATotal: R$${(total + deliveryFee).toFixed(2)}%0A%0AForma de pagamento: ${formaPagamento}%0A%0AEndereco de entrega:%0A${address}%0A%0AMuito obrigado!%0A%0A`;

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


                
                document.addEventListener('DOMContentLoaded', function() {
                    const openCustomComboModalBtn = document.getElementById('open-custom-combo-modal');
                    const customComboModal = document.getElementById('custom-combo-modal');
                    const closeCustomComboModalBtn = document.getElementById('close-custom-combo-modal');
                    const addToCartComboBtn = document.getElementById('add-to-cart-combo');
                    const comboOptionsContainer = document.getElementById('combo-options');
                    const comboTotalElement = document.getElementById('combo-total');
                    let currentComboItems = [];
                    let currentComboTotal = 0;
                
                    // Evento para abrir o modal
                    openCustomComboModalBtn.addEventListener('click', function() {
                        buildComboOptions();
                        customComboModal.style.display = 'block';
                    });
                
                    // Evento para fechar o modal
                    closeCustomComboModalBtn.addEventListener('click', function() {
                        customComboModal.style.display = 'none';
                        resetComboOptions();
                    });
                
                    // Construir as opções do combo dinamicamente
                    function buildComboOptions() {
                        // Exemplo de opções (você pode adicionar suas próprias opções aqui)
                        const comboItems = [
                            { name: 'Niguiri', price: 2.00 },
                            { name: 'Joe', price: 2.30 },
                            { name: 'hussomaki', price: 2.00 },
                            { name: 'sashimi', price: 2.00 },
                            { name: 'hussomaki com salmao grelhado', price: 2.10 },
                            { name: 'Joe maçaricado', price: 2.40 },
                            { name: 'frutamaki', price: 1.50 },
                            { name: 'hot-roll', price: 2.00 },
                            { name: 'uramaki', price: 1.80 }
                        ];
                
                        comboOptionsContainer.innerHTML = '';
                
                        comboItems.forEach(item => {
                            const div = document.createElement('div');
                            div.classList.add('combo-item');
                            div.innerHTML = `
                                <div>
                                    <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
                                    <div class="quantity-controls">
                                        <button class="add-combo-item btn" data-name="${item.name}" data-price="${item.price}">+</button>
                                        <span class="item-quantity" data-name="${item.name}">0</span>
                                        <button class="remove-combo-item btn" data-name="${item.name}" data-price="${item.price}">-</button>
                                    </div>
                                </div>
                            `;
                            comboOptionsContainer.appendChild(div);
                
                            // Eventos para adicionar e remover itens do combo
                            const addButton = div.querySelector('.add-combo-item');
                            const removeButton = div.querySelector('.remove-combo-item');
                
                            addButton.addEventListener('click', function() {
                                const itemName = addButton.getAttribute('data-name');
                                const itemPrice = parseFloat(addButton.getAttribute('data-price'));
                                addToCombo(itemName, itemPrice);
                            });
                
                            removeButton.addEventListener('click', function() {
                                const itemName = removeButton.getAttribute('data-name');
                                const itemPrice = parseFloat(removeButton.getAttribute('data-price'));
                                removeFromCombo(itemName, itemPrice);
                            });
                        });
                    }
                
                    // Adicionar item ao combo
                    function addToCombo(name, price) {
                        const existingItem = currentComboItems.find(item => item.name === name);
                        if (existingItem) {
                            existingItem.quantity += 1;
                        } else {
                            currentComboItems.push({ name, price, quantity: 1 });
                        }
                        const quantitySpan = comboOptionsContainer.querySelector(`.item-quantity[data-name="${name}"]`);
                        quantitySpan.textContent = existingItem ? existingItem.quantity.toString() : '1';
                        updateComboTotal();
                    }
                
                    // Remover item do combo
                    function removeFromCombo(name, price) {
                        const index = currentComboItems.findIndex(item => item.name === name);
                        if (index !== -1) {
                            const item = currentComboItems[index];
                            if (item.quantity > 0) {
                                item.quantity -= 1;
                                const quantitySpan = comboOptionsContainer.querySelector(`.item-quantity[data-name="${name}"]`);
                                quantitySpan.textContent = item.quantity.toString();
                                if (item.quantity === 0) {
                                    currentComboItems.splice(index, 1);
                                }
                            }
                        }
                        updateComboTotal();
                    }
                
                    // Atualizar o preço total do combo
                    function updateComboTotal() {
                        currentComboTotal = currentComboItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                        comboTotalElement.textContent = `Total: R$ ${currentComboTotal.toFixed(2)}`;
                    }
                
                    // Resetar opções do combo ao fechar o modal
                    function resetComboOptions() {
                        currentComboItems = [];
                        currentComboTotal = 0;
                        updateComboTotal();
                
                        // Resetar quantidades exibidas no modal
                        const quantitySpans = comboOptionsContainer.querySelectorAll('.item-quantity');
                        quantitySpans.forEach(span => {
                            span.textContent = '0';
                        });
                    }
                
                    // Adicionar ao carrinho quando finalizar
                    addToCartComboBtn.addEventListener('click', function() {
                        if (currentComboItems.length > 0) {
                            currentComboItems.forEach(item => {
                                // Adicionar cada item ao carrinho original (cartList)
                                for (let i = 0; i < item.quantity; i++) {
                                    addToCart(item.name, item.price);
                                }
                            });
                            customComboModal.style.display = 'none';
                            resetComboOptions();
                        }
                    });
                
                    // Função simulada para adicionar ao carrinho (cartList)
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
                
                });
                