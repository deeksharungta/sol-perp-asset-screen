# SOL-PERP asset detail screen

My take-home for Miracle: the SOL-PERP asset detail screen rebuilt from the Figma in React Native.

## Run it

Needs Node 24 (see `.nvmrc`) and Expo Go for SDK 58.

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, or open the URL in Expo Go on a phone.

## What's in it

- Header with back, asset icon and chain badge, share (native share sheet) and notifications. Once the chart scrolls away, the header shows the live price, and tapping the title scrolls back up.
- Price block with the live price and change, and the Open interest / 24h volume switcher.
- Candlestick and line charts (switch with the toggle), with y-axis labels, the dashed current price line, the price tag and 8 timeframes.
- Scrub: drag sideways to move a crosshair over the chart, in either mode. The price block turns into an O/H/L/C readout for that candle, and the price tag and dashed line move to its close.
- Feed / Holders / About tabs, the "People you follow" filter and the Size sort.
- Trader cards with stats, likes, comments and the "older" expander.
- Long / Short buttons pinned to the bottom, with a blur behind them.

## How it's built

Expo SDK 58, React Native 0.88, Reanimated 4, Gesture Handler 3, Skia, NativeWind and TypeScript.

```
src/
  screens/     AssetDetailScreen: the screen and the shared values it hands down
  components/  chart, price, header, feed, holders, about, tabs, trade, ui, icons
  hooks/       useLivePrice
  theme/       colours, surfaces, typography, animation timings
  utils/       chart maths and number/date formatting
  data/        mock market, candles, posts and holders
```

### Decisions

**The chart is Skia, drawn as a few paths.** All green candles are one path, all red candles another, and line mode is a third. They're rebuilt only when the data, the size, the draw-in or the live price changes, never while scrubbing. The crosshair and the dimming are separate small paths.

**Gestures stay on the UI thread.** The scrub is one pan gesture. A vertical swipe fails it, so the page still scrolls when you start on the chart. Haptics fire only when the selected candle changes.

**Live values don't re-render React.** The price, the scrub position and the scrub progress are shared values. Text that changes every frame (price, change, OHLC, tag) is a read-only `TextInput` whose text is set from the UI thread (`AnimatedText`). `Intl` isn't available on the UI thread, so candle times are formatted once on the JS side and prices use a small worklet formatter.

**Mock live price.** `useLivePrice` nudges the price every second. The price block, the header, the tag, the dashed line and the last candle all read the same shared value, so a tick doesn't re-render the screen or the feed.

**Timeframe changes keep the chart mounted.** I first remounted the chart with `key={timeframe}` to restart the draw-in, but for a moment after each switch the new pan gesture wasn't hooked up yet, so scrubbing didn't start. Now the chart stays mounted and the draw-in progress resets before the data changes.

**Motion.** Things you press (Long/Short, like) use springs. Things that slide between options (tabs, the timeframe pill, the candles/line crossfade) share one 250ms ease-out curve. Candles grow in from left to right over 700ms. Reanimated's default `ReduceMotion.System` turns all of it off when Reduce Motion is on.

**Feed.** Cards are memoized, and liking a post creates a new object for that post only, so only that card re-renders. Holders and About are short, so they render as the list footer instead of their own lists.

**Safe areas.** The header and the trade bar use the safe-area insets. On phones without a home indicator (iPhone SE) the bar still keeps 12pt from the bottom edge.

**Theme.** Colours come from the Figma variables (`theme/colors.ts` and the Tailwind config). The font is SF Pro Rounded. iOS uses the system copy through the `ui-rounded` family. Android bundles the font files through expo-font. Apple's licence only covers Apple platforms, so a production app would switch Android to a licensed rounded font.

### Trade-offs and notes on the Figma

- The Figma has a green text colour but no red one, so I added `#D9323B` with the same weight as the green.
- The candles are a seeded random walk, so the chart looks the same on every launch. 1D starts at the open price ($163.77), so the "+$7.43 1D" in the price block matches the chart.
- The avatars are illustrations rather than the photos in the Figma.
- Android uses a plain fade instead of a blur under the header and the trade buttons, because the blur looked muddy on some devices.
- There are no tests yet.

## What I'd do next

- Real data from Hyperliquid: `candleSnapshot` for history and the `candle` WebSocket subscription for the live candle, written into the same shared values.
- Unit tests for the chart maths and formatters, plus a render-count test for the price ticker.
- Draw the live candle as its own path, so a tick doesn't rebuild the other 39.
- VoiceOver support for the chart: step through candles with swipe up and down.
- Navigation for the back button, the post detail screen and the trade flow.

## How I worked

I planned each part, built it in small steps with Claude Code, and reviewed and tested every change on the simulator before committing. The decisions and trade-offs above are mine.
