try {
  (() => {
    var b = __STORYBOOK_API__,
      {
        ActiveTabs: A,
        Consumer: R,
        ManagerContext: P,
        Provider: h,
        RequestResponseError: y,
        addons: E,
        combineParameters: C,
        controlOrMetaKey: O,
        controlOrMetaSymbol: U,
        eventMatchesShortcut: N,
        eventToShortcut: V,
        experimental_MockUniversalStore: B,
        experimental_UniversalStore: L,
        experimental_requestResponse: k,
        experimental_useUniversalStore: H,
        isMacLike: Y,
        isShortcutTaken: f,
        keyToSymbol: g,
        merge: M,
        mockChannel: x,
        optionOrAltSymbol: D,
        shortcutMatchesShortcut: G,
        shortcutToHumanString: v,
        types: F,
        useAddonState: K,
        useArgTypes: j,
        useArgs: w,
        useChannel: q,
        useGlobalTypes: X,
        useGlobals: J,
        useParameter: Z,
        useSharedState: z,
        useStoryPrepared: W,
        useStorybookApi: Q,
        useStorybookState: $,
      } = __STORYBOOK_API__;
    var d = (() => {
        let e;
        return (
          typeof window < 'u'
            ? (e = window)
            : typeof globalThis < 'u'
              ? (e = globalThis)
              : typeof window < 'u'
                ? (e = window)
                : typeof self < 'u'
                  ? (e = self)
                  : (e = {}),
          e
        );
      })(),
      l = 'tag-filters',
      m = 'static-filter';
    E.register(l, e => {
      let i = Object.entries(d.TAGS_OPTIONS ?? {}).reduce((o, s) => {
        let [r, n] = s;
        return (n.excludeFromSidebar && (o[r] = !0), o);
      }, {});
      e.experimental_setFilter(m, o => {
        let s = o.tags ?? [];
        return (
          (s.includes('dev') || o.type === 'docs') &&
          s.filter(r => i[r]).length === 0
        );
      });
    });
  })();
} catch (e) {
  console.error(
    '[Storybook] One of your manager-entries failed: ' + import.meta.url,
    e
  );
}
