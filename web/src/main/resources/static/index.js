// index.js
// Fetch /api/cards/featured and render them into the page.
// This script is deliberately defensive about the JSON shape so it works with
// a few different APIs / mock backends.

document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const cardsEl = document.getElementById('cards');

    // Show loading state
    statusEl.hidden = false;
    cardsEl.hidden = true;
    statusEl.textContent = 'Loading featured cards…';

    fetchFeaturedCards()
        .then(renderCards)
        .catch(err => {
            console.error('Failed to load featured cards', err);
            statusEl.textContent = 'Could not load featured cards. Please try again later.';
        });

    // ---------- functions ----------

    async function fetchFeaturedCards() {
        const resp = await fetch('/api/cards/featured', { headers: { 'Accept': 'application/json' }});
        if (!resp.ok) {
            const text = await resp.text().catch(()=>null);
            throw new Error(`HTTP ${resp.status} ${resp.statusText} ${text ? '- ' + text : ''}`);
        }
        const data = await resp.json();

        // Normalize: if response is an object with "cards" property, use it; otherwise assume array
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.cards)) return data.cards;
        // otherwise try to convert object values to array (fallback)
        if (data && typeof data === 'object') return Object.values(data);
        throw new Error('Unexpected response format from /api/cards/featured');
    }

    function renderCards(items) {
        const statusEl = document.getElementById('status');
        const cardsEl = document.getElementById('cards');

        if (!items || items.length === 0) {
            statusEl.textContent = 'No featured cards at the moment.';
            cardsEl.hidden = true;
            return;
        }

        // Clear previous
        cardsEl.innerHTML = '';
        statusEl.hidden = true;
        cardsEl.hidden = false;

        items.forEach(item => {
            // try to be flexible about field names
            const id = item.id ?? item.cardId ?? item.uuid ?? '';
            const title = item.name ?? item.title ?? item.cardName ?? 'Untitled Card';
            const description = item.description ?? item.desc ?? item.summary ?? item.specialty ?? '';
            const price = item.price ?? item.cost ?? item.listPrice ?? null;
            const imageUrl = item.imageUrl ?? item.image ?? item.img ?? item.thumbnail ?? null;

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
                // fallback if image fails
                img.onerror = () => {
                    img.style.display = 'none';
                    media.textContent = titleInitials(title);
                }
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

            const p = document.createElement('p');
            p.className = 'card-desc';
            p.textContent = description || 'No description available.';

            const meta = document.createElement('div');
            meta.className = 'card-meta';

            const priceEl = document.createElement('div');
            priceEl.className = 'price';
            priceEl.textContent = price != null ? formatPrice(price) : '—';

            const btn = document.createElement('button');
            btn.className = 'cta';
            btn.type = 'button';
            btn.textContent = 'View';
            // "View" is a mock: we don't navigate anywhere in this static demo.
            btn.onclick = () => {
                alert(`${title}\n\n${description || '(no description)'}\n\nPrice: ${priceEl.textContent}`);
            };

            meta.appendChild(priceEl);
            meta.appendChild(btn);

            content.appendChild(h3);
            content.appendChild(p);
            content.appendChild(meta);

            card.appendChild(media);
            card.appendChild(content);
            cardsEl.appendChild(card);
        });
    }

    // helpers
    function titleInitials(title) {
        // generate short initials to show over gradient when image is missing
        const words = (title || '').trim().split(/\s+/).slice(0,3);
        const initials = words.map(w => w[0]?.toUpperCase() ?? '').join('');
        return initials || 'FC';
    }

    function formatPrice(val) {
        // try to be flexible with numeric / string values
        const num = (typeof val === 'string') ? Number(val.replace(/[^0-9.-]+/g,'')) : Number(val);
        if (!Number.isFinite(num)) return String(val);
        // local formatting (USD as default)
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
        } catch (e) {
            return `$${num.toFixed(2)}`;
        }
    }
});