try {
  (() => {
    var S = __STORYBOOK_API__,
      {
        ActiveTabs: a,
        Consumer: A,
        ManagerContext: l,
        Provider: R,
        RequestResponseError: b,
        addons: _,
        combineParameters: C,
        controlOrMetaKey: P,
        controlOrMetaSymbol: h,
        eventMatchesShortcut: O,
        eventToShortcut: U,
        experimental_MockUniversalStore: y,
        experimental_UniversalStore: V,
        experimental_requestResponse: N,
        experimental_useUniversalStore: B,
        isMacLike: L,
        isShortcutTaken: k,
        keyToSymbol: H,
        merge: D,
        mockChannel: Y,
        optionOrAltSymbol: M,
        shortcutMatchesShortcut: v,
        shortcutToHumanString: G,
        types: x,
        useAddonState: K,
        useArgTypes: F,
        useArgs: j,
        useChannel: g,
        useGlobalTypes: q,
        useGlobals: f,
        useParameter: X,
        useSharedState: w,
        useStoryPrepared: J,
        useStorybookApi: Q,
        useStorybookState: Z,
      } = __STORYBOOK_API__;
    var e = 'storybook/links',
      E = {
        NAVIGATE: `${e}/navigate`,
        REQUEST: `${e}/request`,
        RECEIVE: `${e}/receive`,
      };
    _.register(e, o => {
      o.on(E.REQUEST, ({ kind: u, name: n }) => {
        let i = o.storyId(u, n);
        o.emit(E.RECEIVE, i);
      });
    });
  })();
} catch (e) {
  console.error(
    '[Storybook] One of your manager-entries failed: ' + import.meta.url,
    e
  );
}
