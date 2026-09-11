function formatChangePercent(change) {
    return `${Math.abs(Number(change) || 0).toFixed(2)}%`
}

class BTCTicker {
    constructor(context) {

        this.context = context
        this.lastIcon = ''
        this.HORIZONTAL_COMPRESS = 0.7

        this.settings = {
            showBTC: true,
            showETH: false,
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

            const { showBTC, showETH } = this.settings
            console.log('===fetchData settings:', { showBTC, showETH })

            try {

                const cryptoData = []

                if (showBTC) {
                    const btcResult = await Utils.fetchData("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/lite?id=1")
                    const btcPrice = btcResult.data.statistics.price
                    const btcChange = btcResult.data.statistics.priceChangePercentage24h
                    cryptoData.push({
                        symbol: 'BTC',
                        price: btcPrice,
                        change: btcChange
                    })
                }

                if (showETH) {
                    const ethResult = await Utils.fetchData("https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/lite?id=1027")
                    const ethPrice = ethResult.data.statistics.price
                    const ethChange = ethResult.data.statistics.priceChangePercentage24h
                    cryptoData.push({
                        symbol: 'ETH',
                        price: ethPrice,
                        change: ethChange
                    })
                }

                if (cryptoData.length > 0) {
                    this.createIcon(null, { cryptoData })
                } else {
                    this.createIcon("No crypto selected", null)
                }

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
        if (data && data.cryptoData && data.cryptoData.length > 0) {
            const cryptoData = data.cryptoData
            if (cryptoData.length === 1) {
                const crypto = cryptoData[0]
                const formattedPrice = `${parseInt(crypto.price).toLocaleString()}`
                const formattedChange = formatChangePercent(crypto.change)
                ctx.fillStyle = "#ffffff"
                ctx.shadowColor = "#ffffff"
                ctx.shadowBlur = 0
                ctx.font = `28px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                this.drawTextWithSpacing(ctx, crypto.symbol, leftPadding, centerY - 50, 2, 'left')
                const fontSize = formattedPrice.length > 8 ? 48 : formattedPrice.length > 6 ? 52 : 56
                ctx.font = `${fontSize}px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                this.drawTextWithSpacing(ctx, formattedPrice, leftPadding, centerY - 5, 3, 'left')
                ctx.shadowBlur = 0
                ctx.fillStyle = crypto.change > 0 ? "#3f9c24" : "#c62e1a"
                ctx.shadowColor = crypto.change > 0 ? "#3f9c24" : "#c62e1a"
                ctx.font = `28px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                this.drawTextWithSpacing(ctx, formattedChange, leftPadding, centerY + 40, 2, 'left')
            } else if (cryptoData.length === 2) {
                const btc = cryptoData.find(c => c.symbol === 'BTC')
                const eth = cryptoData.find(c => c.symbol === 'ETH')
                const rightPadding = canvas.width - 10
                if (btc) {
                    const formattedPrice = `${parseInt(btc.price).toLocaleString()}`
                    const formattedChange = formatChangePercent(btc.change)
                    ctx.fillStyle = "#ffffff"
                    ctx.shadowColor = "#ffffff"
                    ctx.shadowBlur = 0
                    ctx.font = `24px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                    this.drawTextWithSpacing(ctx, 'ビットコイン', leftPadding, 35, 2, 'left')
                    const fontSize = formattedPrice.length > 8 ? 48 : formattedPrice.length > 6 ? 52 : 56
                    ctx.font = `${fontSize}px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                    this.drawTextWithSpacing(ctx, formattedPrice, leftPadding, 80, 3, 'left')
                    ctx.fillStyle = btc.change > 0 ? "#3f9c24" : "#c62e1a"
                    ctx.shadowColor = btc.change > 0 ? "#3f9c24" : "#c62e1a"
                    ctx.font = `28px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                    this.drawTextWithSpacing(ctx, formattedChange, leftPadding, 125, 2, 'left')
                }
                if (eth) {
                    const formattedPrice = `${parseInt(eth.price).toLocaleString()}`
                    const formattedChange = formatChangePercent(eth.change)
                    ctx.fillStyle = "#ffffff"
                    ctx.shadowColor = "#ffffff"
                    ctx.shadowBlur = 0
                    ctx.font = `26px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                    const ethLabel = `${eth.symbol} ${formattedPrice}`
                    this.drawTextWithSpacing(ctx, ethLabel, rightPadding, 155, 2, 'right')
                    ctx.fillStyle = eth.change > 0 ? "#3f9c24" : "#c62e1a"
                    ctx.shadowColor = eth.change > 0 ? "#3f9c24" : "#c62e1a"
                    ctx.font = `22px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
                    this.drawTextWithSpacing(ctx, formattedChange, rightPadding, 180, 2, 'right')
                }
            }
        } else if (text) {
            ctx.textAlign = 'center'
            ctx.fillStyle = "#ffffff"
            ctx.shadowColor = "#ffffff"
            ctx.shadowBlur = 8
            const fontSize = text.length > 8 ? 24 : text.length > 6 ? 28 : 32
            ctx.font = `${fontSize}px "FOT-Matisse Pro", "MatissePro-EB", sans-serif`
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
        
        // Handle checkbox values properly
        if (jsn.showBTC !== undefined) {
            jsn.showBTC = jsn.showBTC === true || jsn.showBTC === 'on' || jsn.showBTC === 'true'
        }
        if (jsn.showETH !== undefined) {
            jsn.showETH = jsn.showETH === true || jsn.showETH === 'on' || jsn.showETH === 'true'
        }
        
        this.settings = {
            ...this.settings,
            ...jsn
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