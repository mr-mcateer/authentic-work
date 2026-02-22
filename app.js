// ===== MATERIAL RATES (per sq in) =====
// Source: RAM Steelco quote 10/22/2025 to Crescent Valley High School
// 14ga: 48x96 sheet, 100 lbs, $121.60/CWT = $0.026/sq in
// 16ga: 48x96 sheet, 80 lbs, $118.46/CWT = $0.021/sq in
// 12ga/18ga: extrapolated from weight ratios at ~$120/CWT
const materials = [
    { id: '12ga_steel', name: '12ga Steel', rate: 0.036, desc: 'Heavy duty' },
    { id: '14ga_steel', name: '14ga Steel', rate: 0.026, desc: 'Strong' },
    { id: '16ga_steel', name: '16ga Steel', rate: 0.021, desc: 'Standard' },
    { id: '18ga_steel', name: '18ga Steel', rate: 0.016, desc: 'Light' }
];

const finishes = [
    { id: 'bare',   name: 'Bare Metal', cost: 0  },
    { id: 'powder', name: 'Powder Coat', cost: 15 },
    { id: 'paint',  name: 'Paint',       cost: 10 },
    { id: 'weld',   name: 'TIG Weld',    cost: 25 }
];

// Consumable wear: plasma tips, nozzles, electrodes, shield gas
const CONSUMABLE_RATE = 0.01;
// 20% waste from kerf, edge margins, nesting inefficiency
const WASTE_FACTOR = 1.2;
// Amortized per-job: delivery + proportional shearing
const SHOP_FEE = 10.00;
// Stock sheet dimensions (inches)
const SHEET_MAX_L = 96;
const SHEET_MAX_W = 48;

const TEACHER_EMAIL = 'andy.mcateer@corvallis.k12.or.us';

// ===== STATE =====
let state = {
    sellingPrice: 100,
    materialIndex: 2,  // 16ga steel default (index in 4-item array)
    finishIndex: 0,    // bare metal default
    length: 12,
    width: 12
};

// ===== DOM REFS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    renderMaterialCards();
    renderFinishCards();
    bindEvents();
    loadGallery();
    calculate();
    syncSlidersToInputs();
});

// ===== RENDER MATERIAL CARDS =====
function renderMaterialCards() {
    const container = $('#material-cards');
    container.setAttribute('role', 'radiogroup');
    container.setAttribute('aria-label', 'Material selection');
    container.innerHTML = materials.map((m, i) => `
        <div class="material-card${i === state.materialIndex ? ' active' : ''}" data-index="${i}" tabindex="0" role="radio" aria-checked="${i === state.materialIndex}">
            <div class="material-card-name">${m.name}</div>
            <div class="material-card-price">$${m.rate.toFixed(2)}/in²</div>
            <div class="material-card-desc">${m.desc}</div>
        </div>
    `).join('');
}

// ===== RENDER FINISH CARDS =====
function renderFinishCards() {
    const container = $('#finish-cards');
    container.setAttribute('role', 'radiogroup');
    container.setAttribute('aria-label', 'Finish selection');
    container.innerHTML = finishes.map((f, i) => `
        <div class="finish-card${i === state.finishIndex ? ' active' : ''}" data-index="${i}" tabindex="0" role="radio" aria-checked="${i === state.finishIndex}">
            <div class="finish-card-name">${f.name}</div>
            <div class="finish-card-price">${f.cost === 0 ? 'No charge' : '+$' + f.cost}</div>
        </div>
    `).join('');
}

// ===== BIND ALL EVENTS =====
function bindEvents() {
    // Material cards
    function selectMaterial(card) {
        state.materialIndex = parseInt(card.dataset.index);
        $$('.material-card').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-checked', 'false'); });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        calculate();
    }
    $('#material-cards').addEventListener('click', (e) => {
        const card = e.target.closest('.material-card');
        if (card) selectMaterial(card);
    });
    $('#material-cards').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const card = e.target.closest('.material-card');
            if (card) selectMaterial(card);
        }
    });

    // Finish cards
    function selectFinish(card) {
        state.finishIndex = parseInt(card.dataset.index);
        $$('.finish-card').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-checked', 'false'); });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        calculate();
    }
    $('#finish-cards').addEventListener('click', (e) => {
        const card = e.target.closest('.finish-card');
        if (card) selectFinish(card);
    });
    $('#finish-cards').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const card = e.target.closest('.finish-card');
            if (card) selectFinish(card);
        }
    });

    // Selling price
    $('#sellingPrice').addEventListener('input', (e) => {
        state.sellingPrice = parseFloat(e.target.value) || 0;
        calculate();
    });

    // Length slider + number
    $('#lengthSlider').addEventListener('input', (e) => {
        state.length = parseFloat(e.target.value) || 0;
        $('#lengthNum').value = state.length;
        calculate();
        updateSizePreview();
    });
    $('#lengthNum').addEventListener('input', (e) => {
        state.length = parseFloat(e.target.value) || 0;
        $('#lengthSlider').value = Math.min(state.length, 60);
        calculate();
        updateSizePreview();
    });

    // Width slider + number
    $('#widthSlider').addEventListener('input', (e) => {
        state.width = parseFloat(e.target.value) || 0;
        $('#widthNum').value = state.width;
        calculate();
        updateSizePreview();
    });
    $('#widthNum').addEventListener('input', (e) => {
        state.width = parseFloat(e.target.value) || 0;
        $('#widthSlider').value = Math.min(state.width, 60);
        calculate();
        updateSizePreview();
    });

    // Cost detail toggle
    $('#costDetailToggle').addEventListener('click', () => {
        const detail = $('#costDetail');
        const toggle = $('#costDetailToggle');
        detail.classList.toggle('open');
        const isOpen = detail.classList.contains('open');
        toggle.textContent = isOpen ? 'Hide cost breakdown' : 'How is the cost calculated?';
        toggle.setAttribute('aria-expanded', isOpen);
    });

    // Permission form toggle
    $('#permissionToggle').addEventListener('click', () => {
        const form = $('#permissionForm');
        const btn = $('#permissionToggle');
        form.classList.toggle('open');
        btn.classList.toggle('open');
        btn.setAttribute('aria-expanded', form.classList.contains('open'));
    });

    // Submit
    $('#submitBtn').addEventListener('click', submitApplication);
}

function syncSlidersToInputs() {
    $('#lengthSlider').value = state.length;
    $('#lengthNum').value = state.length;
    $('#widthSlider').value = state.width;
    $('#widthNum').value = state.width;
    updateSizePreview();
}

// ===== CORE CALCULATION =====
function calculate() {
    const { sellingPrice, materialIndex, finishIndex, length, width } = state;
    const material = materials[materialIndex];
    const finish = finishes[finishIndex];

    const area = length * width;
    const materialCost = area * material.rate;
    const consumableCost = area * CONSUMABLE_RATE;
    const subtotal = materialCost + consumableCost;
    const wasteCost = subtotal * (WASTE_FACTOR - 1);
    const finishCost = finish.cost;
    const costToMake = Math.ceil(subtotal * WASTE_FACTOR + SHOP_FEE + finishCost);

    const profit = sellingPrice - costToMake;
    const studentEarnings = Math.max(profit * 0.5, 0);
    const schoolFund = Math.max(profit * 0.5, 0);
    const isLoss = profit < 0;
    const breakEven = costToMake;

    // Sheet size warning
    const sheetWarning = $('#sheetWarning');
    const fitsSheet = (length <= SHEET_MAX_L && width <= SHEET_MAX_W) || (length <= SHEET_MAX_W && width <= SHEET_MAX_L);
    if (length > 0 && width > 0 && !fitsSheet) {
        sheetWarning.classList.add('show');
    } else {
        sheetWarning.classList.remove('show');
    }

    // Update earnings hero
    const heroEl = $('#earningsHero');
    $('#earningsAmount').textContent = '$' + studentEarnings.toFixed(2);
    if (isLoss) {
        heroEl.classList.add('warning');
        $('#earningsLabel').textContent = 'You would lose money';
        $('#earningsNote').textContent = 'Raise your price to at least $' + breakEven + ' to break even';
    } else {
        heroEl.classList.remove('warning');
        $('#earningsLabel').textContent = 'Your Earnings (50% of profit)';
        $('#earningsNote').textContent = 'You keep half, the school fund gets half';
    }

    // Warning banner
    const warning = $('#profitWarning');
    if (isLoss && sellingPrice > 0 && length > 0 && width > 0) {
        warning.classList.add('show');
        warning.textContent = 'Your selling price ($' + sellingPrice.toFixed(2) +
            ') is below the cost to build ($' + costToMake.toFixed(2) +
            '). Increase to at least $' + breakEven + ' to break even.';
    } else {
        warning.classList.remove('show');
    }

    // Cost cards
    $('#costFab').textContent = '$' + costToMake.toFixed(2);
    $('#costProfit').textContent = '$' + profit.toFixed(2);
    $('#costStudent').textContent = '$' + studentEarnings.toFixed(2);
    $('#costSchool').textContent = '$' + schoolFund.toFixed(2);

    // Profit color
    $('#costProfit').style.color = isLoss ? 'var(--color-danger)' : 'var(--color-accent)';

    // Cost detail breakdown
    $('#detailArea').textContent = area.toFixed(1) + ' sq in';
    $('#detailMaterial').textContent = '$' + materialCost.toFixed(2);
    $('#detailConsumable').textContent = '$' + consumableCost.toFixed(2);
    $('#detailWaste').textContent = '$' + wasteCost.toFixed(2);
    $('#detailFinish').textContent = finishCost === 0 ? '$0.00' : '$' + finishCost.toFixed(2);
    $('#detailBase').textContent = '$' + SHOP_FEE.toFixed(2);
    $('#detailTotal').textContent = '$' + costToMake.toFixed(2);

    // Summary (in permission form)
    $('#summaryDims').textContent = length + '" × ' + width + '"';
    $('#summaryMat').textContent = material.name;
    $('#summaryFinish').textContent = finish.name;
    $('#summaryCost').textContent = '$' + costToMake.toFixed(2);
    $('#summarySelling').textContent = '$' + sellingPrice.toFixed(2);
    $('#summaryEarnings').textContent = '$' + studentEarnings.toFixed(2);
}

// ===== SIZE PREVIEW =====
function updateSizePreview() {
    const rect = $('#sizeRect');
    const label = $('#sizeLabel');
    const maxPx = 100;
    const maxDim = Math.max(state.length, state.width, 1);
    const scale = maxPx / maxDim;
    const w = Math.max(state.length * scale, 20);
    const h = Math.max(state.width * scale, 20);
    rect.style.width = w + 'px';
    rect.style.height = h + 'px';
    label.textContent = state.length + '" × ' + state.width + '"';
}

// ===== GALLERY =====
function loadGallery() {
    fetch('projects.json?v=' + Date.now())
        .then(r => r.json())
        .then(projects => {
            const grid = $('#galleryGrid');
            grid.innerHTML = projects.map(p => {
                const dims = p.dimensions.split('x');
                return `
                <div class="gallery-card">
                    <img class="gallery-card-img" src="${p.img_url}" alt="${p.title}" loading="lazy">
                    <div class="gallery-card-body">
                        <div class="gallery-card-title">${p.title}</div>
                        <div class="gallery-card-meta">
                            ${p.dimensions}" &middot; ${p.material} &middot; ${p.technique}
                        </div>
                        <button class="gallery-card-btn" data-length="${dims[0]}" data-width="${dims[1]}" data-material="${p.material}">
                            Try this size
                        </button>
                    </div>
                </div>`;
            }).join('');

            // Bind "Try this size" buttons
            grid.querySelectorAll('.gallery-card-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const l = parseFloat(btn.dataset.length);
                    const w = parseFloat(btn.dataset.width);
                    const mat = btn.dataset.material.toLowerCase();

                    state.length = l;
                    state.width = w;
                    syncSlidersToInputs();

                    // Try to match material
                    const matIdx = materials.findIndex(m =>
                        mat.includes(m.name.toLowerCase().split(' ')[0])
                    );
                    if (matIdx !== -1) {
                        state.materialIndex = matIdx;
                        $$('.material-card').forEach(c => c.classList.remove('active'));
                        $$('.material-card')[matIdx].classList.add('active');
                    }

                    calculate();

                    // Scroll to calculator
                    $('#calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        })
        .catch(() => {
            $('#galleryGrid').innerHTML = '<p style="color:var(--color-text-light);text-align:center;padding:var(--space-lg);">Gallery projects could not be loaded.</p>';
        });
}

// ===== SUBMIT APPLICATION =====
function submitApplication() {
    const name = $('#studentName').value.trim();
    const desc = $('#projectDescription').value.trim();

    if (!name) { alert('Please enter your name.'); return; }
    if (!desc) { alert('Please describe your project.'); return; }
    if (state.length <= 0 || state.width <= 0) {
        alert('Please enter valid dimensions.');
        return;
    }

    const material = materials[state.materialIndex];
    const finish = finishes[state.finishIndex];
    const area = state.length * state.width;
    const subtotal = (area * material.rate) + (area * CONSUMABLE_RATE);
    const costToMake = Math.ceil(subtotal * WASTE_FACTOR + SHOP_FEE + finish.cost);

    const subject = `[CVHS Plasma Shop] Fabrication Request - ${name}`;
    const body =
`FABRICATION PERMISSION REQUEST

Student: ${name}

PROJECT
${desc}

SPECIFICATIONS
Dimensions: ${state.length}" × ${state.width}"
Material: ${material.name}
Finish: ${finish.name}
Estimated Cost: $${costToMake.toFixed(2)}
Selling Price: $${state.sellingPrice.toFixed(2)}

REQUEST
Please review this project for:
- Teacher approval
- Engineering review
- Ready-to-ship specifications

Sent via CVHS Plasma Shop Portal`;

    // Gmail compose (corvallis.k12.or.us = Google Workspace / Chromebooks)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${TEACHER_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener');
}
