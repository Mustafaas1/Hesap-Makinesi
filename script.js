document.addEventListener('DOMContentLoaded', () => {
    // ---- TABS ----
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-pane`).classList.add('active');
        });
    });

    // ---- HISTORY & LOCALSTORAGE ----
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('calcHistory')) || [];
    } catch(e) {
        history = [];
    }

    const saveHistory = (expr, res) => {
        // Prevent duplicate consecutive entries
        if(history.length > 0 && history[0].expr === expr && history[0].res === res) return;
        
        history.unshift({ expr, res, id: Date.now() });
        if(history.length > 50) history.pop(); // Keep last 50
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<div style="color:var(--text-secondary);text-align:center;margin-top:20px;">Geçmiş boş</div>';
            return;
        }
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-expr">${item.expr}</div>
                <div class="history-res">${item.res}</div>
            `;
            // If it's a calculator result (not containing arrows), allow restore
            if(!item.expr.includes('➔')) {
                div.addEventListener('click', () => {
                    currentOperand = item.res.toString().replace(/\./g, '').replace(/,/g, '.'); // Handle formatting back to math format
                    if(isNaN(currentOperand)) currentOperand = '0';
                    updateDisplay();
                });
                div.title = "Sonucu hesap makinesine aktar";
            }
            historyList.appendChild(div);
        });
    };

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    });

    renderHistory(); // Initial render

    // ---- CALCULATOR LOGIC ----
    const prevDisplay = document.getElementById('previous-operand');
    const currDisplay = document.getElementById('current-operand');
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let shouldResetScreen = false;

    const updateDisplay = () => {
        currDisplay.innerText = getDisplayNumber(currentOperand);
        if (operation != null) {
            prevDisplay.innerText = `${getDisplayNumber(previousOperand)} ${operation}`;
        } else {
            prevDisplay.innerText = '';
        }
    }

    const getDisplayNumber = (number) => {
        const stringNumber = number.toString();
        if(stringNumber === 'NaN') return 'Hata';
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay},${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    const appendNumber = (number) => {
        if (currentOperand === '0' && number !== '.') currentOperand = '';
        if (number === '.' && currentOperand.includes('.')) return;
        if (shouldResetScreen) {
            currentOperand = number === '.' ? '0.' : number;
            shouldResetScreen = false;
            return;
        }
        currentOperand = currentOperand.toString() + number.toString();
    }

    const chooseOperation = (op) => {
        if (currentOperand === '' && op === '-') {
            currentOperand = '-';
            updateDisplay();
            return;
        }
        if (currentOperand === '' || currentOperand === '-') return;
        if (previousOperand !== '') {
            compute();
        }
        if (['%', 'sin', 'cos', 'tan', 'cot', 'log', 'ln', 'sqrt', 'pi'].includes(op)) {
            let val = parseFloat(currentOperand);
            if (isNaN(val) && op !== 'pi') return;
            
            let res = val;
            let exprPrefix = '';
            const rad = val * (Math.PI / 180); // For trig functions

            switch(op) {
                case '%': 
                    res = val / 100; 
                    currentOperand = res.toString();
                    updateDisplay();
                    return;
                case 'sin': res = Math.sin(rad); exprPrefix = `sin(${val})`; break;
                case 'cos': res = Math.cos(rad); exprPrefix = `cos(${val})`; break;
                case 'tan': 
                    if(val % 180 === 90) res = 'NaN'; 
                    else res = Math.tan(rad); 
                    exprPrefix = `tan(${val})`; 
                    break;
                case 'cot': 
                    if(val % 180 === 0) res = 'NaN'; 
                    else res = 1 / Math.tan(rad); 
                    exprPrefix = `cot(${val})`; 
                    break;
                case 'log': 
                    if(val <= 0) res = 'NaN';
                    else res = Math.log10(val);
                    exprPrefix = `log(${val})`;
                    break;
                case 'ln':
                    if(val <= 0) res = 'NaN';
                    else res = Math.log(val);
                    exprPrefix = `ln(${val})`;
                    break;
                case 'sqrt':
                    if(val < 0) res = 'NaN';
                    else res = Math.sqrt(val);
                    exprPrefix = `√(${val})`;
                    break;
                case 'pi':
                    res = Math.PI;
                    currentOperand = res.toString();
                    shouldResetScreen = true;
                    updateDisplay();
                    return;
            }

            if(typeof res === 'number') {
                // Remove floating point inaccuracies 
                res = Math.round(res * 100000000) / 100000000;
            }
            
            currentOperand = res.toString();
            if(exprPrefix !== '') {
                saveHistory(exprPrefix + ' =', getDisplayNumber(res));
            }
            shouldResetScreen = true;
            updateDisplay();
            return;
        }
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
    }

    const compute = () => {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (operation) {
            case '+': computation = prev + current; break;
            case '−':
            case '-': computation = prev - current; break;
            case '×':
            case '*': computation = prev * current; break;
            case '÷':
            case '/': 
                if(current === 0) { computation = 'NaN'; break; }
                computation = prev / current; 
                break;
            default: return;
        }
        
        // Avoid deep floats
        if(typeof computation === 'number') {
            computation = Math.round(computation * 100000000) / 100000000;
        }

        let expr = `${getDisplayNumber(previousOperand)} ${operation} ${getDisplayNumber(currentOperand)}`;
        let res = getDisplayNumber(computation);
        if(res !== 'Hata') {
            saveHistory(expr + ' =', res);
        }

        currentOperand = computation;
        operation = undefined;
        previousOperand = '';
    }

    document.querySelectorAll('.btn-number').forEach(button => {
        button.addEventListener('click', () => {
            appendNumber(button.dataset.number);
            updateDisplay();
        });
    });

    document.querySelectorAll('.btn-operator').forEach(button => {
        button.addEventListener('click', () => {
            if(button.classList.contains('scientific')) {
                chooseOperation(button.dataset.action);
            } else {
                chooseOperation(button.innerText);
            }
            updateDisplay();
        });
    });

    document.querySelector('.btn-equals').addEventListener('click', () => {
        compute();
        updateDisplay();
        shouldResetScreen = true;
    });

    document.querySelector('[data-action="clear"]').addEventListener('click', () => {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        updateDisplay();
    });

    document.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if(shouldResetScreen) { currentOperand = '0'; shouldResetScreen=false; updateDisplay(); return; }
        currentOperand = currentOperand.toString().slice(0, -1);
        if (currentOperand === '' || currentOperand === '-') currentOperand = '0';
        updateDisplay();
    });

    // Keyboard Support
    document.addEventListener('keydown', e => {
        // Tab check so we don't interfere if user is typing in converter inputs
        if(e.target.tagName === 'INPUT') return;
        
        if((e.key >= 0 && e.key <= 9)) {
            appendNumber(e.key); updateDisplay();
        }
        if(e.key === '.' || e.key === ',') {
            appendNumber('.'); updateDisplay();
        }
        if(e.key === '=' || e.key === 'Enter') {
            e.preventDefault(); compute(); updateDisplay(); shouldResetScreen = true;
        }
        if(e.key === 'Backspace') {
            if(shouldResetScreen) { currentOperand = '0'; shouldResetScreen=false; }
            else { currentOperand = currentOperand.toString().slice(0, -1); if(currentOperand==='' || currentOperand==='-') currentOperand='0'; }
            updateDisplay();
        }
        if(e.key === 'Escape') {
            currentOperand = '0'; previousOperand = ''; operation = undefined; updateDisplay();
        }
        if(['+','-','*','/','%'].includes(e.key)) {
            let op = e.key;
            if(op === '*') op = '×';
            if(op === '/') op = '÷';
            if(op === '-') op = '−';
            chooseOperation(op); updateDisplay();
        }
    });

    // ---- CURRENCY CONVERTER ----
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const currencyAmount = document.getElementById('currency-amount');
    const currencyResult = document.getElementById('currency-result');
    const currencySwap = document.getElementById('currency-swap');
    const currencyRateInfo = document.getElementById('currency-rate-info');
    
    let exchangeRates = {};

    const fetchCurrencies = async () => {
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            exchangeRates = data.rates;
            
            const currencies = Object.keys(exchangeRates);
            currencyFrom.innerHTML = '';
            currencyTo.innerHTML = '';
            
            currencies.forEach(currency => {
                const opt1 = document.createElement('option');
                opt1.value = currency;
                opt1.text = currency;
                currencyFrom.add(opt1);
                
                const opt2 = document.createElement('option');
                opt2.value = currency;
                opt2.text = currency;
                currencyTo.add(opt2);
            });
            
            currencyFrom.value = 'USD';
            currencyTo.value = 'TRY';
            calculateCurrency();
        } catch (error) {
            currencyRateInfo.innerText = "Kur verisi alınamadı. Lütfen internet bağlantınızı kontrol edin.";
        }
    };

    const calculateCurrency = () => {
        if (Object.keys(exchangeRates).length === 0) return;
        const from = currencyFrom.value;
        const to = currencyTo.value;
        const amount = parseFloat(currencyAmount.value);
        
        if (isNaN(amount)) {
            currencyResult.value = '';
            return;
        }

        const inUsd = amount / exchangeRates[from];
        const result = inUsd * exchangeRates[to];
        
        currencyResult.value = result.toFixed(2);
        currencyRateInfo.innerText = `1 ${from} = ${(exchangeRates[to] / exchangeRates[from]).toFixed(4)} ${to}`;
    };

    let currencyTimeout;
    const handleCurrencyChange = () => {
        calculateCurrency();
        clearTimeout(currencyTimeout);
        currencyTimeout = setTimeout(() => {
            const val = parseFloat(currencyAmount.value);
            if(!isNaN(val) && val > 0 && Object.keys(exchangeRates).length > 0) {
               saveHistory(`${val} ${currencyFrom.value} ➔ ${currencyTo.value}`, currencyResult.value);
            }
        }, 1500);
    };

    currencyAmount.addEventListener('input', handleCurrencyChange);
    currencyFrom.addEventListener('change', handleCurrencyChange);
    currencyTo.addEventListener('change', handleCurrencyChange);
    
    currencySwap.addEventListener('click', () => {
        const temp = currencyFrom.value;
        currencyFrom.value = currencyTo.value;
        currencyTo.value = temp;
        handleCurrencyChange();
    });

    fetchCurrencies();

    // ---- LENGTH CONVERTER ----
    const lengthAmount = document.getElementById('length-amount');
    const lengthFrom = document.getElementById('length-from');
    const lengthTo = document.getElementById('length-to');
    const lengthResult = document.getElementById('length-result');
    const lengthSwap = document.getElementById('length-swap');

    const lengthRates = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        mi: 1609.34
    };

    const calculateLength = () => {
        const amount = parseFloat(lengthAmount.value);
        if (isNaN(amount)) { lengthResult.value = ''; return; }
        const from = lengthRates[lengthFrom.value];
        const to = lengthRates[lengthTo.value];
        const result = (amount * from) / to;
        
        lengthResult.value = parseFloat(result.toFixed(6));
    };

    let lengthTimeout;
    const handleLengthChange = () => {
        calculateLength();
        clearTimeout(lengthTimeout);
        lengthTimeout = setTimeout(() => {
            const val = parseFloat(lengthAmount.value);
            if(!isNaN(val) && val > 0) {
                saveHistory(`${val} ${lengthFrom.options[lengthFrom.selectedIndex].text} ➔ ${lengthTo.options[lengthTo.selectedIndex].text}`, lengthResult.value);
            }
        }, 1500);
    };

    lengthAmount.addEventListener('input', handleLengthChange);
    lengthFrom.addEventListener('change', handleLengthChange);
    lengthTo.addEventListener('change', handleLengthChange);

    lengthSwap.addEventListener('click', () => {
        const temp = lengthFrom.value;
        lengthFrom.value = lengthTo.value;
        lengthTo.value = temp;
        handleLengthChange();
    });
    calculateLength();

    // ---- TEMPERATURE CONVERTER ----
    const tempAmount = document.getElementById('temp-amount');
    const tempFrom = document.getElementById('temp-from');
    const tempTo = document.getElementById('temp-to');
    const tempResult = document.getElementById('temp-result');
    const tempSwap = document.getElementById('temp-swap');

    const calculateTemp = () => {
        const amount = parseFloat(tempAmount.value);
        if (isNaN(amount)) { tempResult.value = ''; return; }
        const from = tempFrom.value;
        const to = tempTo.value;
        let result = 0;

        if (from === to) {
            result = amount;
        } else if (from === 'C' && to === 'F') {
            result = (amount * 9/5) + 32;
        } else if (from === 'C' && to === 'K') {
            result = amount + 273.15;
        } else if (from === 'F' && to === 'C') {
            result = (amount - 32) * 5/9;
        } else if (from === 'F' && to === 'K') {
            result = (amount - 32) * 5/9 + 273.15;
        } else if (from === 'K' && to === 'C') {
            result = amount - 273.15;
        } else if (from === 'K' && to === 'F') {
            result = (amount - 273.15) * 9/5 + 32;
        }
        
        tempResult.value = parseFloat(result.toFixed(4));
    };

    let tempTimeout;
    const handleTempChange = () => {
        calculateTemp();
        clearTimeout(tempTimeout);
        tempTimeout = setTimeout(() => {
            const val = parseFloat(tempAmount.value);
            if(!isNaN(val)) {
                saveHistory(`${val} ${tempFrom.options[tempFrom.selectedIndex].text} ➔ ${tempTo.options[tempTo.selectedIndex].text}`, tempResult.value);
            }
        }, 1500);
    };

    tempAmount.addEventListener('input', handleTempChange);
    tempFrom.addEventListener('change', handleTempChange);
    tempTo.addEventListener('change', handleTempChange);

    tempSwap.addEventListener('click', () => {
        const temp = tempFrom.value;
        tempFrom.value = tempTo.value;
        tempTo.value = temp;
        handleTempChange();
    });
    calculateTemp();
});
