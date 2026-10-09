const cartKey = "luxoraCart";

const cartCount = document.getElementById("cartCount");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileClose");

const searchBtn = document.getElementById("searchBtn");
const searchOverlay = document.getElementById("searchOverlay");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const featuredProducts = document.getElementById("featuredProducts");
const newsletterForm = document.getElementById("newsletterForm");
const header = document.querySelector(".header");

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(cartKey)) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    if (!cartCount) return;

    const cart = getCart();

    const total = cart.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
    }, 0);

    cartCount.textContent = total;

    if (total > 0) {
        cartCount.classList.remove("cart-bump");

        void cartCount.offsetWidth;

        cartCount.classList.add("cart-bump");
    }
}

function addToCart(id, quantity = 1) {
    if (typeof products === "undefined") return;

    const product = products.find(
        item => item.id === Number(id)
    );

    if (!product) return;

    const cart = getCart();

    const existing = cart.find(
        item => item.id === product.id
    );

    const amount = Math.max(
        1,
        Math.min(10, Number(quantity) || 1)
    );

    if (existing) {
        existing.quantity = Math.min(
            10,
            (Number(existing.quantity) || 0) + amount
        );
    } else {
        cart.push({
            id: product.id,
            quantity: amount
        });
    }

    saveCart(cart);

    showToast(`${product.name} ajouté au panier`);

    animateCart();
}

function animateCart() {
    const cartButton = document.querySelector(".cart-btn");

    if (!cartButton) return;

    cartButton.classList.remove("cart-pop");

    void cartButton.offsetWidth;

    cartButton.classList.add("cart-pop");
}

function showToast(message) {
    const oldToast = document.querySelector(".luxora-toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className = "luxora-toast";

    toast.innerHTML = `
        <span>✦</span>
        <p>${message}</p>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 350);
    }, 2500);
}

function renderFeaturedProducts() {
    if (!featuredProducts) return;

    if (typeof products === "undefined") {
        featuredProducts.innerHTML = "";
        return;
    }

    const featured = products
        .filter(product => product.featured)
        .slice(0, 4);

    if (!featured.length) {
        featuredProducts.innerHTML = "";
        return;
    }

    featuredProducts.innerHTML = featured.map(product => {

        const oldPrice = product.oldPrice
            ? `<del>${product.oldPrice} DH</del>`
            : "";

        const badge = product.badge
            ? `<span class="product-badge">${product.badge}</span>`
            : "";

        return `
            <article class="product-card">

                <div class="product-image">

                    <a
                        href="product.html?id=${product.id}"
                        class="product-image-link"
                    >

                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            loading="lazy"
                        >

                        ${badge}

                    </a>

                    <button
                        type="button"
                        class="product-cart"
                        data-add="${product.id}"
                        aria-label="Ajouter ${product.name} au panier"
                    >
                        +
                    </button>

                    <a
                        href="product.html?id=${product.id}"
                        class="product-view"
                    >
                        Découvrir
                    </a>

                </div>

                <a
                    href="product.html?id=${product.id}"
                    class="product-info-link"
                >

                    <div class="product-info">

                        <p class="product-category">
                            ${product.category}
                        </p>

                        <h3>
                            ${product.name}
                        </h3>

                        <p class="product-notes">
                            ${product.notes}
                        </p>

                        <div class="product-price">

                            <strong>
                                ${product.price} DH
                            </strong>

                            ${oldPrice}

                        </div>

                    </div>

                </a>

            </article>
        `;

    }).join("");

    featuredProducts
        .querySelectorAll("[data-add]")
        .forEach(button => {

            button.addEventListener("click", event => {

                event.preventDefault();
                event.stopPropagation();

                const id = Number(button.dataset.add);

                addToCart(id, 1);

                button.classList.remove("added");

                void button.offsetWidth;

                button.classList.add("added");

                setTimeout(() => {
                    button.classList.remove("added");
                }, 600);

            });

        });

    initProductTilt();
}

function openMobileMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.add("active");

    document.body.classList.add("menu-open");

    if (menuBtn) {
        menuBtn.setAttribute(
            "aria-expanded",
            "true"
        );
    }
}

function closeMobileMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.remove("active");

    document.body.classList.remove("menu-open");

    if (menuBtn) {
        menuBtn.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}

function openSearch() {
    if (!searchOverlay) return;

    searchOverlay.classList.add("active");

    searchOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("search-open");

    setTimeout(() => {

        if (searchInput) {
            searchInput.focus();
        }

    }, 250);
}

function closeSearchOverlay() {
    if (searchOverlay) {
        searchOverlay.classList.remove("active");

        searchOverlay.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    document.body.classList.remove("search-open");

    if (searchInput) {
        searchInput.value = "";
    }

    if (searchResults) {
        searchResults.innerHTML = "";
    }
}

function searchProducts(value) {
    if (!searchResults) return;

    if (typeof products === "undefined") return;

    const query = String(value || "")
        .trim()
        .toLowerCase();

    if (!query) {
        searchResults.innerHTML = "";
        return;
    }

    const results = products
        .filter(product => {

            const name = String(
                product.name || ""
            ).toLowerCase();

            const category = String(
                product.category || ""
            ).toLowerCase();

            const notes = String(
                product.notes || ""
            ).toLowerCase();

            return (
                name.includes(query) ||
                category.includes(query) ||
                notes.includes(query)
            );

        })
        .slice(0, 5);

    if (!results.length) {

        searchResults.innerHTML = `
            <div class="no-results">
                <span>⌕</span>
                <p>Aucun parfum trouvé.</p>
            </div>
        `;

        return;
    }

    searchResults.innerHTML = results.map(product => {

        return `
            <a
                href="product.html?id=${product.id}"
                class="search-result"
            >

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div>

                    <strong>
                        ${product.name}
                    </strong>

                    <span>
                        ${product.price} DH
                    </span>

                </div>

            </a>
        `;

    }).join("");
}

function handleNewsletter(event) {
    event.preventDefault();

    const newsletterEmail =
        document.getElementById("newsletterEmail");

    if (!newsletterEmail) return;

    const email =
        newsletterEmail.value.trim();

    if (!email) return;

    const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {

        showToast(
            "Veuillez entrer une adresse email valide"
        );

        return;
    }

    localStorage.setItem(
        "luxoraNewsletterEmail",
        email
    );

    if (newsletterForm) {

        newsletterForm.classList.add(
            "newsletter-submitted"
        );

        newsletterForm.innerHTML = `
            <div class="newsletter-success">

                <span>✦</span>

                <div>

                    <strong>
                        Bienvenue dans l'univers LUXORA.
                    </strong>

                    <p>
                        Votre inscription a bien été enregistrée.
                    </p>

                </div>

            </div>
        `;
    }

    showToast("Bienvenue chez LUXORA");
}

function initHeaderScroll() {
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener(
        "scroll",
        () => {

            const currentScroll =
                window.scrollY;

            if (currentScroll > 40) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

            if (
                currentScroll > lastScroll &&
                currentScroll > 500
            ) {

                header.classList.add(
                    "header-hidden"
                );

            } else {

                header.classList.remove(
                    "header-hidden"
                );

            }

            lastScroll = currentScroll;

        },
        {
            passive: true
        }
    );
}

function initReveal() {
    const revealElements =
        document.querySelectorAll(
            ".collection-card, .product-card, .benefit-card, .about-content, .about-image, .newsletter, .section-heading"
        );

    if (!revealElements.length) return;

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );

        revealElements.forEach(
            (element, index) => {

                element.classList.add(
                    "reveal"
                );

                element.style.setProperty(
                    "--reveal-delay",
                    `${Math.min(index * 60, 300)}ms`
                );

                observer.observe(element);

            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );

            }
        );
    }
}

function initProductTilt() {
    const cards =
        document.querySelectorAll(
            ".product-card"
        );

    if (!cards.length) return;

    if (
        !window.matchMedia(
            "(pointer:fine)"
        ).matches
    ) {
        return;
    }

    cards.forEach(card => {

        card.addEventListener(
            "mousemove",
            event => {

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - 0.5) * 5;

                const rotateX =
                    ((y / rect.height) - 0.5) * -5;

                card.style.transform =
                    `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform = "";

            }
        );

    });
}

function initCollectionTilt() {
    const cards =
        document.querySelectorAll(
            ".collection-card"
        );

    if (!cards.length) return;

    if (
        !window.matchMedia(
            "(pointer:fine)"
        ).matches
    ) {
        return;
    }

    cards.forEach(card => {

        card.addEventListener(
            "mousemove",
            event => {

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - 0.5) * 4;

                const rotateX =
                    ((y / rect.height) - 0.5) * -4;

                card.style.transform =
                    `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform = "";

            }
        );

    });
}

function initHeroParallax() {
    const hero =
        document.querySelector(".hero");

    if (!hero) return;

    if (
        !window.matchMedia(
            "(pointer:fine)"
        ).matches
    ) {
        return;
    }

    window.addEventListener(
        "scroll",
        () => {

            const scroll =
                window.scrollY;

            if (
                scroll <
                window.innerHeight
            ) {

                hero.style.setProperty(
                    "--hero-shift",
                    `${scroll * 0.12}px`
                );

            }

        },
        {
            passive: true
        }
    );
}

function initSmoothLinks() {
    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");

                if (
                    !href ||
                    href === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(href);

                if (target) {

                    event.preventDefault();

                    closeMobileMenu();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });
}

if (menuBtn) {
    menuBtn.addEventListener(
        "click",
        openMobileMenu
    );
}

if (mobileClose) {
    mobileClose.addEventListener(
        "click",
        closeMobileMenu
    );
}

document.querySelectorAll(
    ".mobile-menu a"
).forEach(link => {

    link.addEventListener(
        "click",
        closeMobileMenu
    );

});

if (searchBtn) {
    searchBtn.addEventListener(
        "click",
        openSearch
    );
}

if (closeSearch) {
    closeSearch.addEventListener(
        "click",
        closeSearchOverlay
    );
}

if (searchOverlay) {

    searchOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                searchOverlay
            ) {

                closeSearchOverlay();

            }

        }
    );

}

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            searchProducts(
                event.target.value
            );

        }
    );

}

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeSearchOverlay();
            closeMobileMenu();

        }

    }
);

if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        handleNewsletter
    );

}

document.addEventListener(
    "click",
    event => {

        const addButton =
            event.target.closest(
                "[data-add]"
            );

        if (!addButton) return;

        if (
            addButton.closest(
                "#featuredProducts"
            )
        ) {
            return;
        }

        const id =
            Number(addButton.dataset.add);

        if (id) {
            addToCart(id, 1);
        }

    }
);

window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;
window.showToast = showToast;

updateCartCount();

renderFeaturedProducts();

initReveal();

initHeaderScroll();

initCollectionTilt();

initHeroParallax();

initSmoothLinks();