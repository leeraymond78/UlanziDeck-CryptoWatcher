const COINS = [
    { key: 'showBTC', symbol: 'BTC', id: 1 },
    { key: 'showETH', symbol: 'ETH', id: 1027 },
    { key: 'showBNB', symbol: 'BNB', id: 1839 },
    { key: 'showXRP', symbol: 'XRP', id: 52 },
    { key: 'showSOL', symbol: 'SOL', id: 5426 },
    { key: 'showTRX', symbol: 'TRX', id: 1958 }
]

function asBool(value) {
    return value === true || value === 'on' || value === 'true'
}

function formatChangePercent(change) {
    return `${Math.abs(Number(change) || 0).toFixed(2)}%`
}

function formatPrice(value) {
    const amount = Number(value) || 0
    const abs = Math.abs(amount)
    if (abs >= 100) return Math.round(amount).toLocaleString('en-US')
    if (abs >= 1) return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return amount.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

function cryptoTitle(symbol) {
    return `仮想通貨 ${symbol}`
}

function changeColor(change) {
    return change > 0 ? '#3f9c24' : '#c62e1a'
}

function enabledCoins(settings) {
    return COINS.filter((coin) => asBool(settings[coin.key]))
}

function displayLimit(settings) {
    const count = Number(settings.showCount)
    if (count === 1 || count === 2) return count
    return Math.min(2, Math.max(1, enabledCoins(settings).length))
}

function coinsToShow(settings) {
    return enabledCoins(settings).slice(0, displayLimit(settings))
}

class BTCTicker {
    constructor(context) {

        this.context = context
        this.lastIcon = ''
        this.HORIZONTAL_COMPRESS = 0.7

        this.settings = {
            showCount: 1,
            showBTC: true,
            showETH: false,
            showBNB: false,
            showXRP: false,
            showSOL: false,
            showTRX: false,
            refreshDuration: 60
        }
        this.allowSend = true

        this.debounceTimer = 0; // 防抖计时器
        this.refreshTimer = 0 //刷新计时器


        this.run()

    }

    run() {

        this.clear()
        this.fetchData()

        this.refreshTimer = setInterval(() => { this.fetchData() }, this.settings.refreshDuration * 1000)

    }


    fetchData() {

        //防抖，避免150ms内的频繁请求
        if (this.debounceTimer) clearTimeout(this.debounceTimer)

        this.debounceTimer = setTimeout(async () => {

            this.createIcon("Loading...", null) //loading

            const selected = coinsToShow(this.settings)
            console.log('===fetchData settings:', this.settings, selected.map((coin) => coin.symbol))

            if (selected.length === 0) {
                this.createIcon("No crypto selected", null)
                return
            }

            try {
                const cryptoData = await Promise.all(selected.map(async (coin) => {
                    const result = await Utils.fetchData(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/lite?id=${coin.id}`)
                    return {
                        symbol: coin.symbol,
                        price: result.data.statistics.price,
                        change: result.data.statistics.priceChangePercentage24h
                    }
                }))

                this.createIcon(null, { cryptoData })

            } catch (e) {
                console.log('===fetch data error', e)
                this.createIcon("Error", null)
            }

        }, 150);

    }


    drawTextWithSpacing(ctx, text, x, y, letterSpacing = 0, align = 'left') {
        ctx.save()
        ctx.scale(this.HORIZONTAL_COMPRESS, 1)
        const scaledX = x / this.HORIZONTAL_COMPRESS
        ctx.textAlign = 'left'
        if (letterSpacing === 0) {
            if (align === 'right') {
                const metrics = ctx.measureText(text)
                ctx.fillText(text, scaledX - metrics.width, y)
            } else {
                ctx.fillText(text, scaledX, y)
            }
            ctx.restore()
            return
        }
        let totalWidth = 0
        const charWidths = []
        for (let i = 0; i < text.length; i++) {
            const char = text[i]
            const width = ctx.measureText(char).width
            charWidths.push(width)
            totalWidth += width
        }
        const spacing = letterSpacing * (text.length - 1)
        const startX = align === 'right' ? scaledX - (totalWidth + spacing) : scaledX
        let currentX = startX
        for (let i = 0; i < text.length; i++) {
            const char = text[i]
            ctx.fillText(char, currentX, y)
            currentX += charWidths[i] + letterSpacing
        }
        ctx.restore()
    }
    async createIcon(text, data) {
        const canvas = document.createElement('canvas')
        canvas.width = 196
        canvas.height = 196
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#0a0a0a')
        gradient.addColorStop(1, '#1a1a1a')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        const leftPadding = 10
        const fontStack = '"FOT-Matisse Pro", "MatissePro-EB", sans-serif'
        if (data && data.cryptoData && data.cryptoData.length > 0) {
            const cryptoData = data.cryptoData
            if (cryptoData.length === 1) {
                const crypto = cryptoData[0]
                const formattedPrice = formatPrice(crypto.price)
                const formattedChange = formatChangePercent(crypto.change)
                ctx.fillStyle = "#ffffff"
                ctx.shadowColor = "#ffffff"
                ctx.shadowBlur = 0
                ctx.font = `24px ${fontStack}`
                this.drawTextWithSpacing(ctx, cryptoTitle(crypto.symbol), leftPadding, centerY - 50, 2, 'left')
                const fontSize = formattedPrice.length > 8 ? 48 : formattedPrice.length > 6 ? 52 : 56
                ctx.font = `${fontSize}px ${fontStack}`
                this.drawTextWithSpacing(ctx, formattedPrice, leftPadding, centerY - 5, 3, 'left')
                ctx.shadowBlur = 0
                ctx.fillStyle = changeColor(crypto.change)
                ctx.shadowColor = changeColor(crypto.change)
                ctx.font = `28px ${fontStack}`
                this.drawTextWithSpacing(ctx, formattedChange, leftPadding, centerY + 40, 2, 'left')
            } else {
                const primary = cryptoData[0]
                const secondary = cryptoData[1]
                const rightPadding = canvas.width - 10
                if (primary) {
                    const formattedPrice = formatPrice(primary.price)
                    const formattedChange = formatChangePercent(primary.change)
                    ctx.fillStyle = "#ffffff"
                    ctx.shadowColor = "#ffffff"
                    ctx.shadowBlur = 0
                    ctx.font = `24px ${fontStack}`
                    this.drawTextWithSpacing(ctx, cryptoTitle(primary.symbol), leftPadding, 35, 2, 'left')
                    const fontSize = formattedPrice.length > 8 ? 48 : formattedPrice.length > 6 ? 52 : 56
                    ctx.font = `${fontSize}px ${fontStack}`
                    this.drawTextWithSpacing(ctx, formattedPrice, leftPadding, 80, 3, 'left')
                    ctx.fillStyle = changeColor(primary.change)
                    ctx.shadowColor = changeColor(primary.change)
                    ctx.font = `28px ${fontStack}`
                    this.drawTextWithSpacing(ctx, formattedChange, leftPadding, 125, 2, 'left')
                }
                if (secondary) {
                    const formattedPrice = formatPrice(secondary.price)
                    const formattedChange = formatChangePercent(secondary.change)
                    ctx.fillStyle = "#ffffff"
                    ctx.shadowColor = "#ffffff"
                    ctx.shadowBlur = 0
                    ctx.font = `26px ${fontStack}`
                    this.drawTextWithSpacing(ctx, `${secondary.symbol} ${formattedPrice}`, rightPadding, 155, 2, 'right')
                    ctx.fillStyle = changeColor(secondary.change)
                    ctx.shadowColor = changeColor(secondary.change)
                    ctx.font = `22px ${fontStack}`
                    this.drawTextWithSpacing(ctx, formattedChange, rightPadding, 180, 2, 'right')
                }
            }
        } else if (text) {
            ctx.textAlign = 'center'
            ctx.fillStyle = "#ffffff"
            ctx.shadowColor = "#ffffff"
            ctx.shadowBlur = 8
            const fontSize = text.length > 8 ? 24 : text.length > 6 ? 28 : 32
            ctx.font = `${fontSize}px ${fontStack}`
            ctx.fillText(text, centerX, centerY)
        }
        const s_url = canvas.toDataURL('image/png');
        this.setIcon(s_url);
    }


    setIcon(icon) {
        if (!this.allowSend) return
        this.lastIcon = icon || this.lastIcon
        if (this.lastIcon) $UD.setBaseDataIcon(this.context, this.lastIcon)
    }

    add() {
        this.run()
    }

    setActive(active) {
        this.allowSend = true;
        this.setIcon();
        this.allowSend = active;
    }

    setParams(jsn) {
        console.log('===setParams received:', jsn)
        const next = { ...jsn }

        if (next.showCount !== undefined) {
            const count = Number(next.showCount)
            next.showCount = count === 2 ? 2 : 1
        }

        const fromInspector = next.showCount !== undefined || COINS.some((coin) => coin.key in jsn)
        if (fromInspector) {
            for (const coin of COINS) {
                next[coin.key] = asBool(jsn[coin.key])
            }
        } else {
            for (const coin of COINS) {
                if (coin.key in next) next[coin.key] = asBool(next[coin.key])
            }
        }

        if (next.refreshDuration !== undefined) {
            next.refreshDuration = Number(next.refreshDuration)
        }

        this.settings = {
            ...this.settings,
            ...next
        }
        console.log('===updated settings:', this.settings)

        this.run()

    }

    clear() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
            this.refreshTimer = 0
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = 0
        }
    }


}
