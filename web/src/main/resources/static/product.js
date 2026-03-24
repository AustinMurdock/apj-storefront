// product.js
// Loads /api/cards/{id} and renders product detail view.
// This version follows the Card model exactly (no description field).
// It expects JSON like: { id, name, specialty, contribution, price, imageUrl }

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');

    // fallback: if id not found in query, try to pull trailing path segment (e.g. /product/123)
    if (!id) {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] ?? '';
        if (last && !last.endsWith('.html')) {
            id = last;
        }
    }

    const statusEl = document.getElementById('productStatus');
    const productInner = document.getElementById('productInner');
    const mediaEl = document.getElementById('productMedia');
    const titleEl = document.getElementById('productTitle');
    const specialtyEl = document.getElementById('productSpecialty');
    const contributionEl = document.getElementById('productContribution');
    const priceEl = document.getElementById('productPrice');
    const searchForm = document.getElementById('searchFormP');
    const searchInput = document.getElementById('searchInputP');

    if (searchForm) {
        searchForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const q = (searchInput.value || '').trim();
            const p = new URLSearchParams();
            if (q) p.set('q', q);
            window.location.href = `product-listing.html?${p.toString()}`;
        });
    }

    if (!id) {
        statusEl.textContent = 'No product specified (missing id).';
        console.warn('product.js: no id found in querystring or path:', window.location.href);
        return;
    }

    // reset UI
    statusEl.textContent = 'Loading product…';
    productInner.hidden = true;

    (async function loadProduct() {
        try {
            const resp = await fetch(`/api/cards/${encodeURIComponent(id)}`, { headers: { 'Accept': 'application/json' }});
            if (!resp.ok) {
                let txt = '';
                try { txt = await resp.text(); } catch (e) { /* ignore */ }
                throw new Error(`Failed to load product: HTTP ${resp.status} ${resp.statusText} ${txt ? '- ' + txt : ''}`);
            }

            const item = await resp.json();
            console.debug('product.js: loaded item', item);

            // The Card model (server) uses these exact fields: imageUrl, specialty, contribution.
            // Map them directly.
            const title = item.name ?? 'Untitled Card';
            const imageUrl = item.imageUrl ?? null;           // exact field
            const specialty = item.specialty ?? '';
            const contribution = item.contribution ?? '';
            const price = item.price ?? null;

            // Render basic fields
            titleEl.textContent = title;
            specialtyEl.textContent = specialty ? `Specialty: ${specialty}` : 'Specialty: —';
            contributionEl.textContent = contribution ? `Contribution: ${contribution}` : 'Contribution: —';
            priceEl.textContent = price != null ? formatPrice(price) : '—';

            // media: show full native 200x280 image whenever possible
            mediaEl.innerHTML = '';
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = title;
                img.width = 200;
                img.height = 280;
                img.onerror = () => {
                    console.warn('product.js: image failed to load:', imageUrl);
                    img.style.display = 'none';
                    mediaEl.textContent = titleInitials(title);
                };
                mediaEl.appendChild(img);
            } else {
                mediaEl.textContent = titleInitials(title);
            }

            statusEl.hidden = true;
            productInner.hidden = false;
        } catch (err) {
            console.error('product.js error:', err);
            productInner.hidden = true;
            statusEl.hidden = false;
            statusEl.textContent = err.message || 'Failed to load product. See console for details.';
        }
    })();

    // helpers
    function titleInitials(title) {
        const words = (title || '').trim().split(/\s+/).slice(0,3);
        const initials = words.map(w => w[0]?.toUpperCase() ?? '').join('');
        return initials || 'FC';
    }

    function formatPrice(val) {
        // price on the model is BigDecimal; JSON will be numeric or string — handle both.
        const num = (typeof val === 'string') ? Number(String(val).replace(/[^0-9.-]+/g,'')) : Number(val);
        if (!Number.isFinite(num)) return String(val || '—');
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
        } catch (e) {
            return `$${num.toFixed(2)}`;
        }
    }
});