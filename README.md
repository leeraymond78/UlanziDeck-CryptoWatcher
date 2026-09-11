# Crypto Watcher for UlanziDeck

<p align="center">
  <img src="assets/demo.png" alt="Crypto Watcher key showing 仮想通貨 BTC and ETH" width="240">
</p>

Shows live crypto prices on an [UlanziDeck](https://www.ulanzi.com/) key. Supported coins: **BTC, ETH, BNB, XRP, SOL, TRX**.

Prices and 24h change come from [CoinMarketCap](https://coinmarketcap.com/). The key uses a dark ticker layout:

**1 crypto**

- **Top:** `仮想通貨` plus the symbol (`仮想通貨 BTC`)
- **Middle:** price
- **Bottom:** 24h change percent (green up, red down — no `+` / `-`)

**2 cryptos**

- First coin uses the same full layout (`仮想通貨 BTC`, price, change)
- Second coin is compact at the bottom right: `ETH 2,464` on one row, change under it

Tap the key to refresh immediately.

For the same typeface as the Futu portfolio key, install **FOT-Matisse Pro EB** on the machine running UlanziDeck.

## Install

1. Clone this repo into your UlanziDeck `Plugins` folder as `com.raykira.cryptowatcher.ulanziPlugin`, or copy that folder there.
2. Restart UlanziDeck.
3. Add **Crypto Watcher** to a key.

Default plugin path on macOS:

```text
~/Library/Application Support/Ulanzi/UlanziDeck/Plugins/com.raykira.cryptowatcher.ulanziPlugin
```

### Settings

- **Cryptos to show:** 1 or 2
- **Cryptocurrencies:** enable/disable BTC, ETH, BNB, XRP, SOL, TRX
- **Refresh interval** (default 1 minute)

If more coins are enabled than the display count, the key uses the first 1 or 2 in that list order.
