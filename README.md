# SOL-PERP asset detail screen

This is my assignment submission for Miracle: the SOL-PERP asset screen from the Figma, built with React Native and Expo, with Reanimated and Gesture Handler for the animations and Skia for the chart.

- [Walkthrough](https://drive.google.com/file/d/1i_-mOMNf8FtWnPPdgjtUDGKAT-3cQfuJ/view?usp=sharing) (about 3 minutes)
- [iOS clip](https://drive.google.com/file/d/1SsLaZX6xCbAz5u07eXd0sY_ykuiAjZhy/view?usp=sharing) (no voiceover)
- [Android clip](https://drive.google.com/file/d/1FdzbEGfwiiwq0DY7JrJUanXcDD5WcbKL/view?usp=sharing) (no voiceover)

## Run it

Needs Node 24 (`nvm use`) and Expo Go for SDK 58.

```bash
npm install
npx expo start
```

Press `i` for the iOS simulator or `a` for an Android emulator, or scan the QR code with Expo Go.

On Android, Expo Go shows the system font. The SF Pro Rounded files are added by a config plugin at build time, so they only show in the APK or a dev build.

To build a release APK yourself (needs the Android SDK):

```bash
npx expo run:android --variant release
```

`npm run lint` and `npm run typecheck` both pass.

## What's in it

- The header has back, the token with its exchange badge, share and notifications. Share opens the native share sheet with the current price. Back and notifications show a "coming soon" toast for now. When you scroll past the chart, the token name switches to the live price and its 24h change, and tapping it takes you back to the top.
- The price block shows the live price and the change since the start of the selected timeframe. Open interest has a small menu to switch it to 24h volume.
- The candlestick chart runs on mock data, with a price that ticks like a live feed. The candles draw in when the screen opens. You can scrub across the chart to see the OHLC and the price at that time, and the green price tag and the dashed line move to the candle under your finger. Switching timeframes zooms the chart between them.
- A toggle switches between candles and a line chart. The candles fold into the line, and the line has the same timeframes and the same scrub.
- Below the chart are the Feed, Holders and About tabs. The tab row sticks under the header as you scroll.
- The feed has the trader cards. You can sort them by size, filter to people you follow, like or unlike a post, and open someone's older trades.
- Holders lists the top holders with their position, leverage and PnL. About has the market stats.
- Long and Short stay pinned to the bottom, with a blur behind them on iOS. They spring when you press them, show a "coming soon" toast for now, and shrink a little once you scroll down.
- A scroll-to-top button shows up once you're into the feed.

## How it's built

Expo SDK 58, React Native 0.88, Reanimated 4, Gesture Handler 3, Skia, NativeWind and TypeScript.

```
src/
  screens/      AssetDetailScreen: the list, the header, the tabs and filters, the trade bar and the live price
  components/
    AssetOverview.tsx   everything above the tabs: price block and chart
    chart/      CandleChart and its layers, the axis, the live dot, the scrub overlay and readout
    price/      price block and the metric menu
    header/     header and the fade under it
    feed/       trader cards, filters, likes, older posts
    holders/, about/, tabs/, trade/, icons/
    ui/         small shared pieces: AnimatedText, Card, Toggle, Toast, MaskedBlur…
  hooks/        useLivePrice, useChartScrub, useFeed, useToast
  theme/        palette.json (shared with Tailwind), colours, surfaces, typography, animation timings
  utils/        chart maths and number/date formatting
  data/         mock market, price history, posts and holders
  types/
```

## Decisions

Before building the chart, I looked at how the charts in Rainbow, Farcaster and Fomo work and what I liked about each. The one I liked most was [Liveline](https://benji.org/liveline), a web chart library by Benji Taylor. It only runs on the web, and putting it in a WebView would have made the app slower and the gestures worse. So I rebuilt that feel natively with Skia and Reanimated. The price glides between ticks, the line is a smooth curve, the live dot pulses, and the candles fold into the line.

The live price never goes through React state. It's a Reanimated shared value. A timer picks a new price every half second, and the UI thread eases toward it. The chart, the tag and the price text all read it on the UI thread, so a tick doesn't re-render anything. The chart also rounds the price to half a pixel, so moves too small to see don't rebuild the candles.

Switching timeframes zooms instead of redrawing. At first I remounted the chart for each timeframe with `key={timeframe}`. But for a moment after each switch the scrub gesture wasn't attached yet, so a scrub right after switching didn't start. Now one chart stays mounted and zooms from the old candles to the new ones, by the real ratio between the two time spans. If you tap another timeframe during a zoom, it waits for the current one to finish.

All timeframes come from one price history. It's a seeded random walk over about five years, in 6-hour steps. It's pinned to $18.20 at the start, $163.77 a day ago and $171.20 now. The last 30 days are filled in at 30-second steps. Every timeframe cuts its span into 40 candles, so they all agree with each other, and 1D starts exactly at the 24h open.

The tab row pins as an overlay. A copy of the tab row sits at the top. It takes over exactly when the real one reaches it, and it shares the same indicator, so you can't see the swap. Short tabs get padded to a screen, so the row stays pinned when you switch to them.

The blur behind the header and the buttons is iOS only, because Android's blur left smudges on my phone. Android gets a plain fade instead. The font is SF Pro Rounded: iOS has it built in, and Android bundles the files. Apple's licence only covers Apple platforms, so a real app would use a licensed rounded font on Android.

## Trade-offs and Figma notes

- The Figma has a green but no red, so I added `#D9323B` at the same weight as the green.
- The avatars are illustrations instead of the photos in the Figma.
- On 3M, 6M and 1Y, the recent candles come from the 30-second data, so their wicks run a little taller than the older ones.
- Screen readers hear a fixed price in the labels, not the live one.
- There are no tests yet.

## What I'd do next

- Real data from Hyperliquid: `candleSnapshot` for history and the `candle` WebSocket for the live candle, written into the same shared values.
- Tests for the chart maths, the formatters and the price history, plus a render-count test that shows a tick doesn't re-render the screen.
- Draw the live candle as its own path, so a visible tick doesn't rebuild the other 39.
- VoiceOver for the chart, so you can swipe through candles.
- Navigation: back, the post screen and the trade flow.
- A licensed rounded font on Android.

## Tested on

- iPhone 17 Pro simulator
- iPhone SE (3rd generation) simulator
- My iPhone 12 (the walkthrough is recorded on it)
- Android emulator
- My Samsung Galaxy S23 Ultra, with the release APK

## How I worked

I made the product and design calls: what to build, how it should feel and what to cut. I built it with Claude Code, then reviewed the code and tested it on iOS and Android.
