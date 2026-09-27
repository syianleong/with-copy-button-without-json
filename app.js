// Support both hosted pages and locally opened HTML files.
async function copyResultText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (error) { /* Try the local-file fallback below. */ }
  const previousFocus = document.activeElement;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.appendChild(field);
  try {
    field.select();
    if (!document.execCommand('copy')) throw new Error('Copy unavailable');
  } finally {
    field.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Select Input Elements
  const inputs = {
    spLikes: [
      document.getElementById('sp-likes-1'),
      document.getElementById('sp-likes-2'),
      document.getElementById('sp-likes-3')
    ],
    spViews: [
      document.getElementById('sp-views-1'),
      document.getElementById('sp-views-2'),
      document.getElementById('sp-views-3')
    ],
    orgLikes: [
      document.getElementById('org-likes-1'),
      document.getElementById('org-likes-2')
    ],
    orgViews: [
      document.getElementById('org-views-1'),
      document.getElementById('org-views-2')
    ]
  };

  // Select Output Elements
  const outputs = {
    avgLikes: document.getElementById('avg-likes'),
    avgViews: document.getElementById('avg-views'),
    
    totalSpLikes: document.getElementById('total-sp-likes'),
    totalSpViews: document.getElementById('total-sp-views'),
    avgSpLikes: document.getElementById('avg-sp-likes'),
    avgSpViews: document.getElementById('avg-sp-views'),
    ratioSp: document.getElementById('ratio-sp'),
    
    totalOrgLikes: document.getElementById('total-org-likes'),
    totalOrgViews: document.getElementById('total-org-views'),
    avgOrgLikes: document.getElementById('avg-org-likes'),
    avgOrgViews: document.getElementById('avg-org-views'),
    ratioOrg: document.getElementById('ratio-org'),
    
    likesRatioText: document.getElementById('likes-ratio-text'),
    viewsRatioText: document.getElementById('views-ratio-text'),
    barLikesSp: document.getElementById('bar-likes-sp'),
    barLikesOrg: document.getElementById('bar-likes-org'),
    barViewsSp: document.getElementById('bar-views-sp'),
    barViewsOrg: document.getElementById('bar-views-org')
  };

  // Buttons
  const btnDemo = document.getElementById('btn-demo');
  const btnReset = document.getElementById('btn-reset');

  // Values store
  let currentResults = {
    avgLikes: 0,
    avgViews: 0,
    totalSpLikes: 0,
    totalSpViews: 0,
    avgSpLikes: 0,
    avgSpViews: 0,
    ratioSp: 0,
    totalOrgLikes: 0,
    totalOrgViews: 0,
    avgOrgLikes: 0,
    avgOrgViews: 0,
    ratioOrg: 0
  };

  // Helper to parse input values safely
  const getValue = (input) => {
    const val = parseFloat(input.value);
    return isNaN(val) || val < 0 ? 0 : val;
  };

  // Format numbers with commas (e.g., 10,230)
  const formatNum = (num) => {
    return Math.round(num).toLocaleString('zh-TW');
  };

  // Format percentage
  const formatPercent = (num) => {
    return (num * 100).toFixed(2) + '%';
  };

  // Smooth counter animation for main average numbers
  const animateValue = (element, start, end, duration) => {
    if (start === end) return;
    const range = end - start;
    let current = start;
    const increment = end > start ? Math.ceil(range / (duration / 16)) : Math.floor(range / (duration / 16));
    const stepTime = 16; // Approx 60fps
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = formatNum(current);
    }, stepTime);
  };

  // Core Calculation Function
  const calculate = () => {
    // 1. Fetch values
    const spLikesVals = inputs.spLikes.map(getValue);
    const spViewsVals = inputs.spViews.map(getValue);
    const orgLikesVals = inputs.orgLikes.map(getValue);
    const orgViewsVals = inputs.orgViews.map(getValue);

    // 2. Compute Totals
    const totalSpLikes = spLikesVals.reduce((a, b) => a + b, 0);
    const totalSpViews = spViewsVals.reduce((a, b) => a + b, 0);
    const totalOrgLikes = orgLikesVals.reduce((a, b) => a + b, 0);
    const totalOrgViews = orgViewsVals.reduce((a, b) => a + b, 0);

    const overallLikes = totalSpLikes + totalOrgLikes;
    const overallViews = totalSpViews + totalOrgViews;

    // 3. Compute Averages (Sponsored / 3, Organic / 2, Overall / 5)
    const avgSpLikes = totalSpLikes / 3;
    const avgSpViews = totalSpViews / 3;
    const avgOrgLikes = totalOrgLikes / 2;
    const avgOrgViews = totalOrgViews / 2;

    const avgLikes = overallLikes / 5;
    const avgViews = overallViews / 5;

    // 4. Compute Ratios / Engagement Rates (Likes / Views)
    const ratioSp = totalSpViews > 0 ? totalSpLikes / totalSpViews : 0;
    const ratioOrg = totalOrgViews > 0 ? totalOrgLikes / totalOrgViews : 0;

    // Save previous values for animations
    const prevLikes = currentResults.avgLikes;
    const prevViews = currentResults.avgViews;

    // Store new values
    currentResults = {
      avgLikes,
      avgViews,
      totalSpLikes,
      totalSpViews,
      avgSpLikes,
      avgSpViews,
      ratioSp,
      totalOrgLikes,
      totalOrgViews,
      avgOrgLikes,
      avgOrgViews,
      ratioOrg
    };

    // 5. Update Main Results (with animation)
    animateValue(outputs.avgLikes, prevLikes, avgLikes, 400);
    animateValue(outputs.avgViews, prevViews, avgViews, 400);

    // 6. Update Stats
    outputs.totalSpLikes.textContent = formatNum(totalSpLikes);
    outputs.totalSpViews.textContent = formatNum(totalSpViews);
    outputs.avgSpLikes.textContent = formatNum(avgSpLikes);
    outputs.avgSpViews.textContent = formatNum(avgSpViews);
    outputs.ratioSp.textContent = formatPercent(ratioSp);

    outputs.totalOrgLikes.textContent = formatNum(totalOrgLikes);
    outputs.totalOrgViews.textContent = formatNum(totalOrgViews);
    outputs.avgOrgLikes.textContent = formatNum(avgOrgLikes);
    outputs.avgOrgViews.textContent = formatNum(avgOrgViews);
    outputs.ratioOrg.textContent = formatPercent(ratioOrg);

    // 7. Update Charts (Likes and Views Distribution)
    if (overallLikes > 0) {
      const spLikesPercent = (totalSpLikes / overallLikes) * 100;
      const orgLikesPercent = (totalOrgLikes / overallLikes) * 100;
      outputs.barLikesSp.style.width = `${spLikesPercent}%`;
      outputs.barLikesOrg.style.width = `${orgLikesPercent}%`;
      outputs.likesRatioText.textContent = `${spLikesPercent.toFixed(1)}% vs ${orgLikesPercent.toFixed(1)}%`;
    } else {
      outputs.barLikesSp.style.width = `50%`;
      outputs.barLikesOrg.style.width = `50%`;
      outputs.likesRatioText.textContent = `0.0% vs 0.0%`;
    }

    if (overallViews > 0) {
      const spViewsPercent = (totalSpViews / overallViews) * 100;
      const orgViewsPercent = (totalOrgViews / overallViews) * 100;
      outputs.barViewsSp.style.width = `${spViewsPercent}%`;
      outputs.barViewsOrg.style.width = `${orgViewsPercent}%`;
      outputs.viewsRatioText.textContent = `${spViewsPercent.toFixed(1)}% vs ${orgViewsPercent.toFixed(1)}%`;
    } else {
      outputs.barViewsSp.style.width = `50%`;
      outputs.barViewsOrg.style.width = `50%`;
      outputs.viewsRatioText.textContent = `0.0% vs 0.0%`;
    }
  };

  // Add event listeners to inputs for real-time calculations
  const allInputElements = [
    ...inputs.spLikes,
    ...inputs.spViews,
    ...inputs.orgLikes,
    ...inputs.orgViews
  ];

  allInputElements.forEach(input => {
    input.addEventListener('input', calculate);
    // Select input content on focus for easier editing
    input.addEventListener('focus', (e) => {
      e.target.select();
    });
  });

  // Load Demo Data
  btnDemo.addEventListener('click', () => {
    // Premium representative demo numbers
    const demoData = {
      spLikes: [12400, 18900, 15300],
      spViews: [248000, 312000, 275000],
      orgLikes: [8900, 6200],
      orgViews: [195000, 142000]
    };

    inputs.spLikes.forEach((input, index) => input.value = demoData.spLikes[index]);
    inputs.spViews.forEach((input, index) => input.value = demoData.spViews[index]);
    inputs.orgLikes.forEach((input, index) => input.value = demoData.orgLikes[index]);
    inputs.orgViews.forEach((input, index) => input.value = demoData.orgViews[index]);

    calculate();
  });

  // Clear Fields
  btnReset.addEventListener('click', () => {
    allInputElements.forEach(input => input.value = '');
    calculate();
  });

  // Copy one final result, independent of the animated display.
  document.querySelectorAll('[data-copy-target]').forEach(button => {
    let feedbackTimer;
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const key = Object.keys(outputs).find(key => outputs[key] === target);
      const text = Object.hasOwn(currentResults, key)
        ? (key.startsWith('ratio') ? formatPercent(currentResults[key]) : formatNum(currentResults[key]))
        : target.textContent.trim();
      if (target.id === 'general-display' && !Number.isFinite(Number(text))) {
        button.textContent = '無可複製結果';
      } else {
        button.disabled = true;
        try {
          await copyResultText(text);
          button.textContent = '已複製';
        } catch (error) {
          button.textContent = '請手動複製';
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(target);
          selection.removeAllRanges();
          selection.addRange(range);
        } finally {
          button.disabled = false;
        }
      }
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => { button.textContent = '複製'; }, 2000);
    });
  });

  // Initial Calculation on load (will show zeros)
  calculate();
});

// Independent state and scoped keyboard events for the general calculator.
document.addEventListener('DOMContentLoaded', () => {
  const calculator = document.getElementById('general-calculator');
  const display = document.getElementById('general-display');
  const expression = document.getElementById('general-expression');
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  let entry = '0', stored = null, operator = null, fresh = false, failed = false;
  const reset = () => {
    entry = '0'; stored = null; operator = null; fresh = false; failed = false;
    expression.textContent = '準備計算';
  };
  const compute = (left, right, op) => {
    if (op === '/' && right === 0) throw new Error('不能除以零');
    const value = op === '+' ? left + right : op === '-' ? left - right : op === '*' ? left * right : left / right;
    if (!Number.isFinite(value)) throw new Error('數值超出範圍');
    return Number(value.toPrecision(12)).toString();
  };
  const press = (key) => {
    try {
      if (key === 'clear') reset();
      else if (/^[0-9.]$/.test(key)) {
        if (failed) reset();
        if (fresh) { entry = '0'; fresh = false; }
        if (!operator) expression.textContent = '輸入中';
        if (key === '.') { if (!entry.includes('.')) entry += '.'; }
        else if (entry.replace(/[-.]/g, '').length < 15) {
          entry = entry === '0' ? key : entry === '-0' ? '-' + key : entry + key;
        }
      } else if (!failed && key === 'backspace') {
        if (!fresh) { entry = entry.slice(0, -1); if (entry === '' || entry === '-') entry = '0'; }
      } else if (!failed && key === 'sign') {
        if (fresh && operator) { entry = '-0'; fresh = false; }
        else { entry = entry.startsWith('-') ? entry.slice(1) : '-' + entry; fresh = false; }
      } else if (!failed && symbols[key]) {
        if (operator && !fresh) entry = compute(stored, Number(entry), operator);
        stored = Number(entry); operator = key; fresh = true;
        expression.textContent = `${entry} ${symbols[key]}`;
      } else if (!failed && key === 'equals' && operator && !fresh) {
        const label = `${stored} ${symbols[operator]} ${entry} =`;
        entry = compute(stored, Number(entry), operator);
        expression.textContent = label;
        stored = null; operator = null; fresh = true;
      }
    } catch (error) {
      entry = error.message; failed = true; stored = null; operator = null; fresh = true;
      expression.textContent = '請按 AC 或輸入數字重新開始';
    }
    display.textContent = entry;
  };
  calculator.addEventListener('click', event => {
    const button = event.target.closest('button[data-key]');
    if (button) press(button.dataset.key);
  });
  calculator.addEventListener('keydown', event => {
    if (event.target.closest('[data-copy-target]')) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const key = ({ Enter: 'equals', '=': 'equals', Escape: 'clear', Delete: 'clear', Backspace: 'backspace', '×': '*', '÷': '/', '−': '-' })[event.key] || event.key;
    if (/^[0-9.+*/-]$/.test(key) || ['equals', 'clear', 'backspace'].includes(key)) {
      event.preventDefault();
      press(key);
    }
  });
});
