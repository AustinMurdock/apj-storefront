// product-listing.js
// Browse: server-side pagination via GET /api/trading-cards?page=&size=&sort=
// Search / filter: fetch full list from API, then client-side pagination.

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const sort = params.get('sort') || '';
    const pageParam = params.get('page');
    const currentPage = Math.max(0, parseInt(pageParam || '0', 10));
    const specialty = (params.get('specialty') || '').trim();
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');

    const PAGE_SIZE = 12;
    const PER_PAGE_CLIENT = 20;

    const searchInput = document.getElementById('searchInputPL');
    const searchForm = document.getElementById('searchFormPL');
    const sortByEl = document.getElementById('sortBy');
    const filterSpecialtyEl = document.getElementById('filterSpecialty');
    const filterMinPriceEl = document.getElementById('filterMinPrice');
    const filterMaxPriceEl = document.getElementById('filterMaxPrice');
    const applyPriceBtn = document.getElementById('applyPrice');
    const clearFiltersBtn = document.getElementById('clearFilters');

    const statusEl = document.getElementById('statusPL');
    const gridEl = document.getElementById('productsGrid');
    const paginationEl = document.getElementById('pagination');
    const resultsHeading = document.getElementById('resultsHeading');
    const resultsSummary = document.getElementById('resultsSummary');

    let clientPage = 1;
    let fullList = [];

    function isBrowseMode() {
        return !q && !specialty && minPrice === null && maxPrice === null;
    }

    function updateUrl(updates) {
        const p = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === '' || v === null || v === undefined) p.delete(k);
            else p.set(k, String(v));
        });
        const query = p.toString();
        const url = query ? `product-listing.html?${query}` : 'product-listing.html';
        window.history.replaceState({}, '', url);
    }

    if (searchInput) searchInput.value = q;
    if (sortByEl) sortByEl.value = sort;
    if (filterMinPriceEl && minPrice !== null) filterMinPriceEl.value = minPrice;
    if (filterMaxPriceEl && maxPrice !== null) filterMaxPriceEl.value = maxPrice;

    if (searchForm) {
        searchForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const newQ = (searchInput.value || '').trim();
            const p = new URLSearchParams();
            if (newQ) p.set('q', newQ);
            window.location.href = `product-listing.html?${p.toString()}`;
        });
    }

    sortByEl?.addEventListener('change', () => {
        updateUrl({ sort: sortByEl.value || null, page: 0 });
        load();
    });

    filterSpecialtyEl?.addEventListener('change', () => {
        const val = (filterSpecialtyEl?.value || '').trim();
        updateUrl({ specialty: val || null, page: 0 });
        load();
    });

    applyPriceBtn?.addEventListener('click', () => {
        const min = filterMinPriceEl?.value;
        const max = filterMaxPriceEl?.value;
        updateUrl({ minPrice: min || null, maxPrice: max || null, page: 0 });
        load();
    });

    clearFiltersBtn?.addEventListener('click', () => {
        if (filterSpecialtyEl) filterSpecialtyEl.value = '';
        if (filterMinPriceEl) filterMinPriceEl.value = '';
        if (filterMaxPriceEl) filterMaxPriceEl.value = '';
        window.location.href = 'product-listing.html';
    });

    async function loadSpecialties() {
        try {
            const resp = await fetch('/api/trading-cards/specialties', { headers: { 'Accept': 'application/json' } });
            if (!resp.ok) return;
            const list = await resp.json();
            if (!Array.isArray(list) || !filterSpecialtyEl) return;
            list.forEach(s => {
                if (s != null && String(s).trim() !== '') {
                    const opt = document.createElement('option');
                    opt.value = String(s).trim();
                    opt.textContent = String(s).trim();
                    filterSpecialtyEl.appendChild(opt);
                }
            });
        } catch (e) {
            console.warn('Could not load specialties', e);
        }
    }

    loadSpecialties().then(() => {
        if (specialty && filterSpecialtyEl) filterSpecialtyEl.value = specialty;
        load();
    });

    function buildBrowseUrl(page, sortVal) {
        const p = new URLSearchParams();
        p.set('page', String(page));
        p.set('size', String(PAGE_SIZE));
        if (sortVal) p.set('sort', sortVal);
        return `/api/trading-cards?${p.toString()}`;
    }

    async function load() {
        statusEl.textContent = 'Loading products…';
        statusEl.hidden = false;
        gridEl.hidden = true;
        paginationEl.hidden = true;

        const currentParams = new URLSearchParams(window.location.search);
        const pageNum = Math.max(0, parseInt(currentParams.get('page') || '0', 10));
        const currentQ = (currentParams.get('q') || '').trim();
        const currentSpecialty = (currentParams.get('specialty') || '').trim();
        const currentMinPrice = currentParams.get('minPrice');
        const currentMaxPrice = currentParams.get('maxPrice');

        try {
            if (currentQ) {
                const resp = await fetch(`/api/trading-cards/search?query=${encodeURIComponent(currentQ)}`, { headers: { 'Accept': 'application/json' } });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                fullList = await resp.json();
                if (!Array.isArray(fullList)) fullList = [];
                clientPage = Math.max(1, pageNum + 1);
                renderClientPaginated(fullList, currentQ, null, null);
                return;
            }
            if (currentSpecialty) {
                const resp = await fetch(`/api/trading-cards/filter/specialty?specialty=${encodeURIComponent(currentSpecialty)}`, { headers: { 'Accept': 'application/json' } });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                fullList = await resp.json();
                if (!Array.isArray(fullList)) fullList = [];
                clientPage = Math.max(1, pageNum + 1);
                renderClientPaginated(fullList, null, currentSpecialty, null);
                return;
            }
            if (currentMinPrice !== null || currentMaxPrice !== null) {
                const p = new URLSearchParams();
                if (currentMinPrice !== null && currentMinPrice !== '') p.set('minPrice', currentMinPrice);
                if (currentMaxPrice !== null && currentMaxPrice !== '') p.set('maxPrice', currentMaxPrice);
                const resp = await fetch(`/api/trading-cards/filter/price?${p.toString()}`, { headers: { 'Accept': 'application/json' } });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                fullList = await resp.json();
                if (!Array.isArray(fullList)) fullList = [];
                clientPage = Math.max(1, pageNum + 1);
                renderClientPaginated(fullList, null, null, 'price');
                return;
            }

            const currentSort = currentParams.get('sort') || sort;
            const url = buildBrowseUrl(pageNum, currentSort);
            const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const items = Array.isArray(data) ? data : [];
            const hasMore = items.length >= PAGE_SIZE;
            resultsHeading.textContent = 'Products';
            resultsSummary.textContent = items.length === 0
                ? 'No products found.'
                : `Page ${pageNum + 1}${hasMore ? '' : ' (last page)'}. ${items.length} item${items.length === 1 ? '' : 's'}.`;
            renderCards(items);
            renderServerPagination(pageNum, hasMore);
        } catch (err) {
            console.error(err);
            statusEl.textContent = 'Failed to load products. Please try again later.';
        }
    }

    function renderClientPaginated(items, searchQ, specialtyLabel, priceLabel) {
        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / PER_PAGE_CLIENT));
        clientPage = Math.min(Math.max(1, clientPage), totalPages);
        const start = (clientPage - 1) * PER_PAGE_CLIENT;
        const pageItems = items.slice(start, start + PER_PAGE_CLIENT);

        const cp = new URLSearchParams(window.location.search);
        const qLabel = (searchQ !== undefined ? searchQ : (cp.get('q') || '').trim());
        const spLabel = (specialtyLabel !== undefined ? specialtyLabel : (cp.get('specialty') || '').trim());
        const hasPriceFilter = (priceLabel !== undefined && priceLabel) || cp.has('minPrice') || cp.has('maxPrice');
        if (qLabel) resultsHeading.textContent = `Search results for "${qLabel}"`;
        else if (spLabel) resultsHeading.textContent = `Specialty: ${spLabel}`;
        else if (hasPriceFilter) resultsHeading.textContent = 'Filtered by price';
        else resultsHeading.textContent = 'Products';
        resultsSummary.textContent = `${total} product${total === 1 ? '' : 's'} found. Showing page ${clientPage} of ${totalPages}.`;

        if (pageItems.length === 0) {
            statusEl.textContent = 'No products found.';
            statusEl.hidden = false;
            gridEl.hidden = true;
            paginationEl.hidden = true;
            return;
        }

        statusEl.hidden = true;
        gridEl.hidden = false;
        renderCards(pageItems);
        renderClientPagination(totalPages);
    }

    function renderCards(items) {
        gridEl.innerHTML = '';
        items.forEach(item => {
            const id = item.id ?? item.cardId ?? item.uuid ?? '';
            const title = item.name ?? item.title ?? item.cardName ?? 'Untitled Card';
            const imageUrl = item.imageURL ?? item.imageUrl ?? item.image ?? item.img ?? item.thumbnail ?? null;
            const specialtyVal = item.specialty ?? item.category ?? '';
            const contribution = item.contribution ?? item.contributor ?? item.author ?? '';
            const price = item.price ?? item.cost ?? item.listPrice ?? null;
            const description = item.description ?? item.desc ?? '';

            const card = document.createElement('article');
            card.className = 'card';
            card.setAttribute('tabindex', '0');
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
            desc.textContent = description || `${specialtyVal ? specialtyVal + ' · ' : ''}${contribution ? 'By: ' + contribution : ''}`;

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
    }

    function renderServerPagination(currentPageZeroBased, hasMore) {
        paginationEl.hidden = false;
        paginationEl.innerHTML = '';

        const prevPage = Math.max(0, currentPageZeroBased - 1);
        const nextPage = currentPageZeroBased + 1;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.textContent = '‹ Prev';
        prevBtn.setAttribute('aria-label', 'Previous page');
        prevBtn.disabled = currentPageZeroBased === 0;
        prevBtn.addEventListener('click', () => {
            updateUrl({ page: prevPage });
            load();
        });
        paginationEl.appendChild(prevBtn);

        const pageLabel = document.createElement('span');
        pageLabel.className = 'page-info';
        pageLabel.textContent = `Page ${currentPageZeroBased + 1}`;
        paginationEl.appendChild(pageLabel);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.textContent = 'Next ›';
        nextBtn.setAttribute('aria-label', 'Next page');
        nextBtn.disabled = !hasMore;
        nextBtn.addEventListener('click', () => {
            updateUrl({ page: nextPage });
            load();
        });
        paginationEl.appendChild(nextBtn);
    }

    function renderClientPagination(totalPages) {
        if (totalPages <= 1) {
            paginationEl.hidden = true;
            return;
        }
        paginationEl.hidden = false;
        paginationEl.innerHTML = '';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.textContent = '‹ Prev';
        prevBtn.setAttribute('aria-label', 'Previous page');
        prevBtn.addEventListener('click', () => {
            clientPage = Math.max(1, clientPage - 1);
            updateUrl({ page: clientPage - 1 });
            renderClientPaginated(fullList);
        });
        paginationEl.appendChild(prevBtn);

        const pageLabel = document.createElement('span');
        pageLabel.className = 'page-info';
        pageLabel.textContent = `Page ${clientPage} of ${totalPages}`;
        paginationEl.appendChild(pageLabel);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.textContent = 'Next ›';
        nextBtn.setAttribute('aria-label', 'Next page');
        nextBtn.addEventListener('click', () => {
            clientPage = Math.min(totalPages, clientPage + 1);
            updateUrl({ page: clientPage - 1 });
            renderClientPaginated(fullList);
        });
        paginationEl.appendChild(nextBtn);
    }

    function titleInitials(title) {
        const words = (title || '').trim().split(/\s+/).slice(0, 3);
        return words.map(w => w[0]?.toUpperCase() ?? '').join('') || 'FC';
    }

    function formatPrice(val) {
        const num = (typeof val === 'string') ? Number(val.replace(/[^0-9.-]+/g, '')) : Number(val);
        if (!Number.isFinite(num)) return String(val);
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
        } catch (e) {
            return `$${num.toFixed(2)}`;
        }
    }

    load();
});
