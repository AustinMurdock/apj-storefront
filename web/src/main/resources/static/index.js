// index.js
// Handles header search/navigation and homepage featured fetch

document.addEventListener('DOMContentLoaded', () => {
    // Search on homepage header
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    if (searchForm) {
        searchForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const q = (searchInput.value || '').trim();
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            window.location.href = `product-listing.html?${params.toString()}`;
        });
    }

    // Fetch featured cards for the homepage
    const statusEl = document.getElementById('status');
    const cardsEl = document.getElementById('cards');

    if (!statusEl || !cardsEl) return;

    statusEl.hidden = false;
    cardsEl.hidden = true;
    statusEl.textContent = 'Loading featured cards…';

    fetchFeaturedCards()
        .then(renderCards)
        .catch(err => {
            console.error('Failed to load featured cards', err);
            statusEl.textContent = 'Could not load featured cards. Please try again later.';
        });

    async function fetchFeaturedCards() {
        const resp = await fetch('/api/trading-cards/featured', { headers: { 'Accept': 'application/json' }});
        if (!resp.ok) {
            const text = await resp.text().catch(()=>null);
            throw new Error(`HTTP ${resp.status} ${resp.statusText} ${text ? '- ' + text : ''}`);
        }
        const data = await resp.json();

        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.cards)) return data.cards;
        if (data && typeof data === 'object') return Object.values(data);
        throw new Error('Unexpected response format from /api/trading-cards/featured');
    }

    function renderCards(items) {
        if (!items || items.length === 0) {
            statusEl.textContent = 'No featured cards at the moment.';
            cardsEl.hidden = true;
            return;
        }

        cardsEl.innerHTML = '';
        statusEl.hidden = true;
        cardsEl.hidden = false;

        items.forEach(item => {
            const id = item.id ?? item.cardId ?? item.uuid ?? '';
            const title = item.name ?? item.title ?? item.cardName ?? 'Untitled Card';
            const description = item.description ?? item.desc ?? item.summary ?? '';
            const price = item.price ?? item.cost ?? item.listPrice ?? null;
            const imageUrl = item.imageURL ?? item.imageUrl ?? item.image ?? item.img ?? item.thumbnail ?? null;
            const specialty = item.specialty ?? item.skill ?? item.category ?? '';
            const contribution = item.contribution ?? item.contributor ?? item.author ?? '';

            const card = document.createElement('article');
            card.className = 'card';
            card.setAttribute('tabindex','0');
            card.setAttribute('aria-labelledby', `card-title-${id}`);

            const media = document.createElement('div');
            media.className = 'card-media';
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = title;
                img.onerror = () => { img.style.display = 'none'; media.textContent = titleInitials(title); };
                media.appendChild(img);
            } else {
                media.textContent = titleInitials(title);
            }

            const content = document.createElement('div');
            content.className = 'card-content';

            const h3 = document.createElement('h3');
            h3.className = 'card-title';
            h3.id = `card-title-${id}`;
            h3.textContent = title;

            const desc = document.createElement('p');
            desc.className = 'card-desc';
            desc.textContent = description || `${specialty ? specialty + ' · ' : ''}${contribution ? 'By: ' + contribution : ''}`;

            const meta = document.createElement('div');
            meta.className = 'card-meta';

            const row = document.createElement('div');
            row.className = 'meta-row';

            const priceEl = document.createElement('div');
            priceEl.className = 'price';
            priceEl.textContent = price != null ? formatPrice(price) : '—';

            const link = document.createElement('a');
            link.className = 'cta';
            link.setAttribute('role','button');
            link.href = `product.html?id=${encodeURIComponent(id)}`;
            link.textContent = 'View';

            row.appendChild(priceEl);
            row.appendChild(link);

            meta.appendChild(row);

            content.appendChild(h3);
            content.appendChild(desc);
            content.appendChild(meta);

            card.appendChild(media);
            card.appendChild(content);
            cardsEl.appendChild(card);
        });
    }

    // helpers
    function titleInitials(title) {
        const words = (title || '').trim().split(/\s+/).slice(0,3);
        const initials = words.map(w => w[0]?.toUpperCase() ?? '').join('');
        return initials || 'FC';
    }

    function formatPrice(val) {
        const num = (typeof val === 'string') ? Number(val.replace(/[^0-9.-]+/g,'')) : Number(val);
        if (!Number.isFinite(num)) return String(val);
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
        } catch (e) {
            return `$${num.toFixed(2)}`;
        }
    }
});