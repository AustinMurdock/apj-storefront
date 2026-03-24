// product-listing.js
// Fetch all products from /api/cards, optionally filter by q (from querystring),
// and display client-side pagination with 20 items per page and 5 cards per row.

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const searchInput = document.getElementById('searchInputPL');
    const searchForm = document.getElementById('searchFormPL');

    if (searchInput) searchInput.value = q;
    if (searchForm) {
        searchForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const newQ = (searchInput.value || '').trim();
            const newParams = new URLSearchParams();
            if (newQ) newParams.set('q', newQ);
            window.location.href = `product-listing.html?${newParams.toString()}`;
        });
    }

    const statusEl = document.getElementById('statusPL');
    const gridEl = document.getElementById('productsGrid');
    const paginationEl = document.getElementById('pagination');
    const resultsHeading = document.getElementById('resultsHeading');
    const resultsSummary = document.getElementById('resultsSummary');

    const PER_PAGE = 20;
    let allItems = [];
    let filteredItems = [];
    let currentPage = 1;

    fetchAll()
        .then(items => {
            allItems = items;
            if (q) {
                filteredItems = filterItems(allItems, q);
            } else {
                filteredItems = allItems.slice();
            }
            renderResults();
        })
        .catch(err => {
            console.error(err);
            statusEl.textContent = 'Failed to load products. Please try again later.';
        });

    async function fetchAll() {
        const resp = await fetch('/api/cards', { headers: { 'Accept': 'application/json' }});
        if (!resp.ok) {
            const text = await resp.text().catch(()=>null);
            throw new Error(`HTTP ${resp.status} ${resp.statusText} ${text ? '- ' + text : ''}`);
        }
        const data = await resp.json();
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.cards)) return data.cards;
        if (data && typeof data === 'object') return Object.values(data);
        return [];
    }

    function filterItems(items, q) {
        const s = q.toLowerCase();
        return items.filter(item => {
            const title = (item.name ?? item.title ?? '').toString().toLowerCase();
            const specialty = (item.specialty ?? item.category ?? '').toString().toLowerCase();
            const contribution = (item.contribution ?? item.contributor ?? item.author ?? '').toString().toLowerCase();
            const desc = (item.description ?? item.desc ?? '').toString().toLowerCase();
            return title.includes(s) || specialty.includes(s) || contribution.includes(s) || desc.includes(s);
        });
    }

    function renderResults() {
        const total = filteredItems.length;
        const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
        currentPage = Math.min(Math.max(1, currentPage), totalPages);

        resultsHeading.textContent = q ? `Search results for “${q}”` : 'Products';
        resultsSummary.textContent = `${total} product${total === 1 ? '' : 's'} found. Showing page ${currentPage} of ${totalPages}.`;

        const start = (currentPage - 1) * PER_PAGE;
        const pageItems = filteredItems.slice(start, start + PER_PAGE);

        gridEl.innerHTML = '';
        if (pageItems.length === 0) {
            statusEl.textContent = 'No products found.';
            statusEl.hidden = false;
            gridEl.hidden = true;
            paginationEl.hidden = true;
            return;
        }

        statusEl.hidden = true;
        gridEl.hidden = false;

        pageItems.forEach(item => {
            const id = item.id ?? item.cardId ?? item.uuid ?? '';
            const title = item.name ?? item.title ?? item.cardName ?? 'Untitled Card';
            const imageUrl = item.imageURL ?? item.imageUrl ?? item.image ?? item.img ?? item.thumbnail ?? null;
            const specialty = item.specialty ?? item.category ?? '';
            const contribution = item.contribution ?? item.contributor ?? item.author ?? '';
            const price = item.price ?? item.cost ?? item.listPrice ?? null;
            const description = item.description ?? item.desc ?? '';

            const card = document.createElement('article');
            card.className = 'card';
            card.setAttribute('tabindex','0');
            card.setAttribute('aria-labelledby', `prod-title-${id}`);

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
            h3.id = `prod-title-${id}`;
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
            gridEl.appendChild(card);
        });

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            paginationEl.hidden = true;
            return;
        }
        paginationEl.hidden = false;
        paginationEl.innerHTML = '';

        function makeBtn(label, page, isCurrent = false, ariaLabel = null) {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            btn.textContent = label;
            if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
            if (isCurrent) btn.setAttribute('aria-current', 'true');
            btn.addEventListener('click', () => {
                currentPage = page;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                renderResults();
            });
            return btn;
        }

        const prevBtn = makeBtn('‹ Prev', Math.max(1, currentPage - 1), false, 'Previous page');
        paginationEl.appendChild(prevBtn);

        const maxButtons = 7;
        let start = Math.max(1, currentPage - Math.floor(maxButtons/2));
        let end = start + maxButtons - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }

        for (let p = start; p <= end; p++) {
            const btn = makeBtn(String(p), p, p === currentPage, `Go to page ${p}`);
            paginationEl.appendChild(btn);
        }

        const nextBtn = makeBtn('Next ›', Math.min(totalPages, currentPage + 1), false, 'Next page');
        paginationEl.appendChild(nextBtn);
    }

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