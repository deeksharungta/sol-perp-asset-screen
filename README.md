# SOL-PERP asset detail screen

My take-home for Miracle: the SOL-PERP asset detail screen rebuilt from the Figma in React Native.

**Recording:** _link to come_
**Android APK:** _link to come_

## Run it

Needs Node 24 (see `.nvmrc`) and Expo Go for SDK 58.

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, or scan the QR code with Expo Go on a phone.

**Font in Expo Go on Android:** Android gets SF Pro Rounded from font files that the expo-font config plugin bundles at build time. Expo Go can't run config plugins, so on Android in Expo Go the text falls back to the system font. iOS uses the system's own rounded font, so it looks right everywhere. To see the real font on Android, use the APK or a dev build (`npx expo run:android`).

To build the APK yourself (the `preview` profile in `eas.json` outputs an `.apk`):

```bash
npx eas-cli@latest build --platform android --profile preview
```

Other scripts: `npm run lint` and `npm run typecheck`.

## What's in it

- **Header:** back, asset icon with the exchange badge, share (native share sheet) and notifications. Once the chart scrolls away, "Solana" switches to the live price and its 24h change. Tapping the title scrolls back to the top.
- **Price block:** the live price, the change over the selected timeframe, and the Open interest / 24h volume switcher.
- **Chart:** candlestick and line charts with y-axis labels, the dashed current-price line, the price tag and 8 timeframes. The toggle morphs between them: candles collapse onto the line and grow back out of it. The line is drawn as smooth curves, and its live end dot pulses.
- **Scrub:** drag sideways and the crosshair follows your finger in either mode. The price block turns into an O/H/L/C readout for the nearest candle, and the price tag and dashed line glide to its close.
- **Tabs:** Feed / Holders / About, plus the "People you follow" filter and the Size sort.
- **Trader cards:** stats, likes with a small burst, comments and the "older" expander.
- **Long / Short:** two buttons pinned to the bottom (details below).
- A scroll-to-top button that appears once you're well into the feed.

## How it's built

Expo SDK 58, React Native 0.88 (New Architecture), Reanimated 4, Gesture Handler 3, Skia, NativeWind and TypeScript.

```
src/
  screens/      AssetDetailScreen: the list, the header, the trade bar and the live price
  components/
    AssetOverview.tsx   everything above the feed: price block, chart, tabs, filters
    chart/      CandleChart and its layers, the axis, the live dot, the scrub overlay and readout
    price/      price block and the metric switcher
    header/     header and the blur/fade under it
    feed/       trader cards, filters, likes, older posts
    holders/, about/, tabs/, trade/, icons/
    ui/         small shared pieces: AnimatedText, Card, Toggle, Toast, MaskedBlur…
  hooks/        useLivePrice, useChartScrub, useLivePulse, useFeed, useToast
  theme/        palette.json (shared with Tailwind), colours, surfaces, typography, animation timings
  utils/        chart maths and number/date formatting
  data/         mock market, price history, posts and holders
  types/
```

### Decisions

**The chart is Skia, drawn as a few paths.** All green candles are one path, all red candles another, and line mode is a line plus its gradient area. The paths rebuild when:

- the canvas size changes,
- the draw-in, the candles/line morph or the timeframe zoom is running,
- or the live price moves by at least half a pixel. The chart snaps the live price to the nearest half pixel first, so ticks too small to see don't redraw anything.

In candle mode the line isn't built, and in line mode the candles aren't. Scrubbing never rebuilds them: the crosshair and the dimming are their own small paths.

**Gestures stay on the UI thread.** The scrub is one pan gesture. A vertical swipe fails it, so the page still scrolls when you start on the chart.

**Live values don't re-render React.** The price, the scrub position and the scrub progress are shared values. Text that changes every frame (price, change, OHLC, tag) is a read-only `TextInput` whose text is set from the UI thread (`AnimatedText`). `Intl` isn't available on the UI thread, so candle times are formatted once on the JS side, and prices use a small worklet formatter.

**Mock live price.** `useLivePrice` picks a new target price every 500ms, and a frame callback eases the shown price toward it, so it glides like a live feed instead of jumping. It stops writing once it has caught up, so nothing redraws while the price is still. The price block, the header, the tag, the dashed line and the last candle all read the same shared value, so a tick doesn't re-render the screen or the feed.

**Two different changes.** The price block shows the change since the open of the selected timeframe and labels it ("1D", "1W", "All"…), so it always matches what the chart shows. The header shows the 24h change, like the rest of the app would. On 1D the two are the same number, because the 1D chart starts exactly at the 24h open ($163.77).

**Timeframe zoom.** Switching timeframes zooms instead of redrawing:

- The chart keeps the previous candles, and for 500ms draws both sets on one price range that glides from the old range to the new one.
- The new candles start at the old timeframe's scale and settle into place, while the old ones zoom the other way and fade out. The y-axis labels crossfade halfway through.
- The zoom runs in log space, so going from 1H to All (about 43,000× more time) moves at an even pace instead of crawling and then snapping at the end.
- The left-to-right draw-in only plays on first load.

I first remounted the chart with `key={timeframe}` to replay the draw-in, but for a moment after each switch the new pan gesture wasn't hooked up yet, so a scrub right after switching didn't start. Keeping one chart mounted fixed that, and made the zoom possible.

**Haptics.**

- A light tap when a scrub starts, then a selection tick each time it moves to a new candle.
- A selection tick when switching tabs.
- A light tap when liking a post.
- A medium tap on Long / Short.

Nothing else buzzes, so the haptics keep meaning something.

**Long / Short.**

- **Blur:** on iOS the buttons sit on a blur that fades in through a gradient mask, with a soft white fade on top. Android gets only the fade: its blur needs the content wrapped in a blur target, and it looked muddy on some devices.
- **Press:** the buttons shrink with a spring and spring back on release.
- **Tap:** a "coming soon" toast for now. Back and notifications show one too.

**Feed.**

- **Real filtering:** "People you follow" changes the list's data rather than hiding cards.
- **Toggle timing:** the toggle reports the change only after its knob has finished sliding, so cards mounting or unmounting don't stutter the knob. Rapid taps still end on the right value.
- **Animations:** cards fade in and out, and the Size sort animates the reorder.
- **Re-renders:** cards are memoized, and liking a post creates a new object for that post only, so only that card re-renders. The screen's top-level pieces (overview, header, trade bar, fades) are memoized too, and every handler they get is a stable `useCallback`, so a toast or a tab switch doesn't re-render the chart.
- **Holders and About:** they're short, so they render as the list footer instead of their own lists.

**Mock data.** Every timeframe is cut from one continuous, seeded price history, so they agree with each other and look the same on every launch:

- **Long history:** a log-price random walk in 6-hour steps over about five years (1,800 days), bent to hit three pinned prices: $18.20 at the start, $163.77 24 hours ago and $171.20 now.
- **Recent detail:** the last 30 days are filled in with 30-second steps (a Brownian bridge between each pair of 6-hour points). Short timeframes get real-looking detail and still join up with the long history.
- **Candles:** each timeframe splits its span into 40 equal buckets and reads each bucket's open, high, low and close.
- **Everything else:** posts, holders and market stats are static mock data.

**Motion.**

- **Presses** (Long/Short, likes) use springs.
- **Slides** between options (tabs, the timeframe pill, the toggle, the header's name/price switch) share one 250ms ease-out curve.
- **Chart:**
  - The candles/line morph takes 450ms, the timeframe zoom 500ms, both ease-in-out.
  - Candles grow in from left to right over 700ms on first load.
- **Reduce Motion:** Reanimated's default `ReduceMotion.System` turns all of this off when Reduce Motion is on.

**Safe areas.** The header and the trade bar use the safe-area insets. On phones without a home indicator (iPhone SE), the bar still keeps 12pt from the bottom edge.

**Theme.** Colours come from the Figma variables. `theme/palette.json` is the single source, read by both the Tailwind config and `theme/colors.ts`. The font is SF Pro Rounded: iOS uses the system copy through the `ui-rounded` family, and Android bundles the font files through expo-font. Apple's licence only covers Apple platforms, so a production app would switch Android to a licensed rounded font.

### Trade-offs and notes on the Figma

- The Figma has a green text colour but no red one, so I added `#D9323B` with the same weight as the green.
- The avatars are illustrations rather than the photos in the Figma.
- Android uses a plain fade instead of a blur under the header and the trade buttons (see Long / Short above).
- There are no tests yet.

## What I'd do next

- **Real data from Hyperliquid:** `candleSnapshot` for history and the `candle` WebSocket subscription for the live candle, written into the same shared values.
- **Tests:**
  - Unit tests for the chart maths, the formatters and the price history.
  - A render-count test that proves a price tick doesn't re-render the screen.
- **Live candle path:** draw the live candle as its own path, so a visible tick doesn't rebuild the other 39.
- **VoiceOver for the chart:** step through candles by swiping up and down.
- **Navigation:** the back button, the post detail screen and the trade flow.
- **Android font:** a licensed rounded font instead of SF Pro Rounded.

## Tested on

- iPhone 17 Pro simulator, iOS 26.5
- iPhone 12, release build
- Android: _to fill in_

## How I worked

I planned each part, built it in small steps with Claude Code, and reviewed and tested every change on the simulator before committing. The decisions and trade-offs above are mine.
