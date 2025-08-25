try {
  (() => {
    var me = Object.create;
    var J = Object.defineProperty;
    var he = Object.getOwnPropertyDescriptor;
    var fe = Object.getOwnPropertyNames;
    var _e = Object.getPrototypeOf,
      be = Object.prototype.hasOwnProperty;
    var O = (e =>
      typeof require < 'u'
        ? require
        : typeof Proxy < 'u'
          ? new Proxy(e, {
              get: (t, c) => (typeof require < 'u' ? require : t)[c],
            })
          : e)(function (e) {
      if (typeof require < 'u') return require.apply(this, arguments);
      throw Error('Dynamic require of "' + e + '" is not supported');
    });
    var D = (e, t) => () => (e && (t = e((e = 0))), t);
    var Ee = (e, t) => () => (
      t || e((t = { exports: {} }).exports, t),
      t.exports
    );
    var ge = (e, t, c, l) => {
      if ((t && typeof t == 'object') || typeof t == 'function')
        for (let a of fe(t))
          !be.call(e, a) &&
            a !== c &&
            J(e, a, {
              get: () => t[a],
              enumerable: !(l = he(t, a)) || l.enumerable,
            });
      return e;
    };
    var Se = (e, t, c) => (
      (c = e != null ? me(_e(e)) : {}),
      ge(
        t || !e || !e.__esModule
          ? J(c, 'default', { value: e, enumerable: !0 })
          : c,
        e
      )
    );
    var f = D(() => {});
    var _ = D(() => {});
    var b = D(() => {});
    var se = Ee((ae, Z) => {
      f();
      _();
      b();
      (function (e) {
        if (typeof ae == 'object' && typeof Z < 'u') Z.exports = e();
        else if (typeof define == 'function' && define.amd) define([], e);
        else {
          var t;
          (typeof window < 'u' || typeof window < 'u'
            ? (t = window)
            : typeof self < 'u'
              ? (t = self)
              : (t = this),
            (t.memoizerific = e()));
        }
      })(function () {
        var e, t, c;
        return (function l(a, E, p) {
          function o(n, d) {
            if (!E[n]) {
              if (!a[n]) {
                var r = typeof O == 'function' && O;
                if (!d && r) return r(n, !0);
                if (i) return i(n, !0);
                var I = new Error("Cannot find module '" + n + "'");
                throw ((I.code = 'MODULE_NOT_FOUND'), I);
              }
              var u = (E[n] = { exports: {} });
              a[n][0].call(
                u.exports,
                function (h) {
                  var g = a[n][1][h];
                  return o(g || h);
                },
                u,
                u.exports,
                l,
                a,
                E,
                p
              );
            }
            return E[n].exports;
          }
          for (var i = typeof O == 'function' && O, m = 0; m < p.length; m++)
            o(p[m]);
          return o;
        })(
          {
            1: [
              function (l, a, E) {
                a.exports = function (p) {
                  if (typeof Map != 'function' || p) {
                    var o = l('./similar');
                    return new o();
                  } else return new Map();
                };
              },
              { './similar': 2 },
            ],
            2: [
              function (l, a, E) {
                function p() {
                  return (
                    (this.list = []),
                    (this.lastItem = void 0),
                    (this.size = 0),
                    this
                  );
                }
                ((p.prototype.get = function (o) {
                  var i;
                  if (this.lastItem && this.isEqual(this.lastItem.key, o))
                    return this.lastItem.val;
                  if (((i = this.indexOf(o)), i >= 0))
                    return ((this.lastItem = this.list[i]), this.list[i].val);
                }),
                  (p.prototype.set = function (o, i) {
                    var m;
                    return this.lastItem && this.isEqual(this.lastItem.key, o)
                      ? ((this.lastItem.val = i), this)
                      : ((m = this.indexOf(o)),
                        m >= 0
                          ? ((this.lastItem = this.list[m]),
                            (this.list[m].val = i),
                            this)
                          : ((this.lastItem = { key: o, val: i }),
                            this.list.push(this.lastItem),
                            this.size++,
                            this));
                  }),
                  (p.prototype.delete = function (o) {
                    var i;
                    if (
                      (this.lastItem &&
                        this.isEqual(this.lastItem.key, o) &&
                        (this.lastItem = void 0),
                      (i = this.indexOf(o)),
                      i >= 0)
                    )
                      return (this.size--, this.list.splice(i, 1)[0]);
                  }),
                  (p.prototype.has = function (o) {
                    var i;
                    return this.lastItem && this.isEqual(this.lastItem.key, o)
                      ? !0
                      : ((i = this.indexOf(o)),
                        i >= 0 ? ((this.lastItem = this.list[i]), !0) : !1);
                  }),
                  (p.prototype.forEach = function (o, i) {
                    var m;
                    for (m = 0; m < this.size; m++)
                      o.call(
                        i || this,
                        this.list[m].val,
                        this.list[m].key,
                        this
                      );
                  }),
                  (p.prototype.indexOf = function (o) {
                    var i;
                    for (i = 0; i < this.size; i++)
                      if (this.isEqual(this.list[i].key, o)) return i;
                    return -1;
                  }),
                  (p.prototype.isEqual = function (o, i) {
                    return o === i || (o !== o && i !== i);
                  }),
                  (a.exports = p));
              },
              {},
            ],
            3: [
              function (l, a, E) {
                var p = l('map-or-similar');
                a.exports = function (n) {
                  var d = new p(!1),
                    r = [];
                  return function (I) {
                    var u = function () {
                      var h = d,
                        g,
                        R,
                        S = arguments.length - 1,
                        V = Array(S + 1),
                        A = !0,
                        w;
                      if ((u.numArgs || u.numArgs === 0) && u.numArgs !== S + 1)
                        throw new Error(
                          'Memoizerific functions should always be called with the same number of arguments'
                        );
                      for (w = 0; w < S; w++) {
                        if (
                          ((V[w] = { cacheItem: h, arg: arguments[w] }),
                          h.has(arguments[w]))
                        ) {
                          h = h.get(arguments[w]);
                          continue;
                        }
                        ((A = !1),
                          (g = new p(!1)),
                          h.set(arguments[w], g),
                          (h = g));
                      }
                      return (
                        A &&
                          (h.has(arguments[S])
                            ? (R = h.get(arguments[S]))
                            : (A = !1)),
                        A ||
                          ((R = I.apply(null, arguments)),
                          h.set(arguments[S], R)),
                        n > 0 &&
                          ((V[S] = { cacheItem: h, arg: arguments[S] }),
                          A ? o(r, V) : r.push(V),
                          r.length > n && i(r.shift())),
                        (u.wasMemoized = A),
                        (u.numArgs = S + 1),
                        R
                      );
                    };
                    return (
                      (u.limit = n),
                      (u.wasMemoized = !1),
                      (u.cache = d),
                      (u.lru = r),
                      u
                    );
                  };
                };
                function o(n, d) {
                  var r = n.length,
                    I = d.length,
                    u,
                    h,
                    g;
                  for (h = 0; h < r; h++) {
                    for (u = !0, g = 0; g < I; g++)
                      if (!m(n[h][g].arg, d[g].arg)) {
                        u = !1;
                        break;
                      }
                    if (u) break;
                  }
                  n.push(n.splice(h, 1)[0]);
                }
                function i(n) {
                  var d = n.length,
                    r = n[d - 1],
                    I,
                    u;
                  for (
                    r.cacheItem.delete(r.arg), u = d - 2;
                    u >= 0 &&
                    ((r = n[u]), (I = r.cacheItem.get(r.arg)), !I || !I.size);
                    u--
                  )
                    r.cacheItem.delete(r.arg);
                }
                function m(n, d) {
                  return n === d || (n !== n && d !== d);
                }
              },
              { 'map-or-similar': 1 },
            ],
          },
          {},
          [3]
        )(3);
      });
    });
    f();
    _();
    b();
    f();
    _();
    b();
    f();
    _();
    b();
    f();
    _();
    b();
    var s = __REACT__,
      {
        Children: Xe,
        Component: Je,
        Fragment: N,
        Profiler: $e,
        PureComponent: Qe,
        StrictMode: et,
        Suspense: tt,
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ot,
        cloneElement: nt,
        createContext: rt,
        createElement: M,
        createFactory: it,
        createRef: ct,
        forwardRef: at,
        isValidElement: st,
        lazy: lt,
        memo: $,
        startTransition: It,
        unstable_act: ut,
        useCallback: Q,
        useContext: pt,
        useDebugValue: dt,
        useDeferredValue: mt,
        useEffect: x,
        useId: ht,
        useImperativeHandle: ft,
        useInsertionEffect: _t,
        useLayoutEffect: bt,
        useMemo: Et,
        useReducer: gt,
        useRef: ee,
        useState: H,
        useSyncExternalStore: St,
        useTransition: yt,
        version: wt,
      } = __REACT__;
    f();
    _();
    b();
    var Rt = __STORYBOOK_API__,
      {
        ActiveTabs: At,
        Consumer: kt,
        ManagerContext: Ot,
        Provider: xt,
        RequestResponseError: Lt,
        addons: G,
        combineParameters: Pt,
        controlOrMetaKey: Bt,
        controlOrMetaSymbol: Vt,
        eventMatchesShortcut: Nt,
        eventToShortcut: Ut,
        experimental_MockUniversalStore: Dt,
        experimental_UniversalStore: Mt,
        experimental_requestResponse: Ht,
        experimental_useUniversalStore: Gt,
        isMacLike: Ft,
        isShortcutTaken: zt,
        keyToSymbol: Yt,
        merge: qt,
        mockChannel: Wt,
        optionOrAltSymbol: jt,
        shortcutMatchesShortcut: Kt,
        shortcutToHumanString: Zt,
        types: te,
        useAddonState: Xt,
        useArgTypes: Jt,
        useArgs: $t,
        useChannel: Qt,
        useGlobalTypes: eo,
        useGlobals: F,
        useParameter: z,
        useSharedState: to,
        useStoryPrepared: oo,
        useStorybookApi: oe,
        useStorybookState: no,
      } = __STORYBOOK_API__;
    f();
    _();
    b();
    var so = __STORYBOOK_COMPONENTS__,
      {
        A: lo,
        ActionBar: Io,
        AddonPanel: uo,
        Badge: po,
        Bar: mo,
        Blockquote: ho,
        Button: fo,
        ClipboardCode: _o,
        Code: bo,
        DL: Eo,
        Div: go,
        DocumentWrapper: So,
        EmptyTabContent: yo,
        ErrorFormatter: wo,
        FlexBar: Co,
        Form: To,
        H1: vo,
        H2: Ro,
        H3: Ao,
        H4: ko,
        H5: Oo,
        H6: xo,
        HR: Lo,
        IconButton: L,
        IconButtonSkeleton: Po,
        Icons: Bo,
        Img: Vo,
        LI: No,
        Link: Uo,
        ListItem: Do,
        Loader: Mo,
        Modal: Ho,
        OL: Go,
        P: Fo,
        Placeholder: zo,
        Pre: Yo,
        ProgressSpinner: qo,
        ResetWrapper: Wo,
        ScrollArea: jo,
        Separator: Ko,
        Spaced: Zo,
        Span: Xo,
        StorybookIcon: Jo,
        StorybookLogo: $o,
        Symbols: Qo,
        SyntaxHighlighter: en,
        TT: tn,
        TabBar: on,
        TabButton: nn,
        TabWrapper: rn,
        Table: cn,
        Tabs: an,
        TabsState: sn,
        TooltipLinkList: Y,
        TooltipMessage: ln,
        TooltipNote: In,
        UL: un,
        WithTooltip: q,
        WithTooltipPure: pn,
        Zoom: dn,
        codeCommon: mn,
        components: hn,
        createCopyToClipboardFunction: fn,
        getStoryHref: _n,
        icons: bn,
        interleaveSeparators: En,
        nameSpaceClassNames: gn,
        resetComponents: Sn,
        withReset: yn,
      } = __STORYBOOK_COMPONENTS__;
    f();
    _();
    b();
    var Rn = __STORYBOOK_THEMING__,
      {
        CacheProvider: An,
        ClassNames: kn,
        Global: W,
        ThemeProvider: On,
        background: xn,
        color: Ln,
        convert: Pn,
        create: Bn,
        createCache: Vn,
        createGlobal: Nn,
        createReset: Un,
        css: Dn,
        darken: Mn,
        ensure: Hn,
        ignoreSsrWarning: Gn,
        isPropValid: Fn,
        jsx: zn,
        keyframes: Yn,
        lighten: qn,
        styled: y,
        themes: Wn,
        typography: jn,
        useTheme: Kn,
        withTheme: Zn,
      } = __STORYBOOK_THEMING__;
    f();
    _();
    b();
    var er = __STORYBOOK_ICONS__,
      {
        AccessibilityAltIcon: tr,
        AccessibilityIcon: or,
        AccessibilityIgnoredIcon: nr,
        AddIcon: rr,
        AdminIcon: ir,
        AlertAltIcon: cr,
        AlertIcon: ar,
        AlignLeftIcon: sr,
        AlignRightIcon: lr,
        AppleIcon: Ir,
        ArrowBottomLeftIcon: ur,
        ArrowBottomRightIcon: pr,
        ArrowDownIcon: dr,
        ArrowLeftIcon: mr,
        ArrowRightIcon: hr,
        ArrowSolidDownIcon: fr,
        ArrowSolidLeftIcon: _r,
        ArrowSolidRightIcon: br,
        ArrowSolidUpIcon: Er,
        ArrowTopLeftIcon: gr,
        ArrowTopRightIcon: Sr,
        ArrowUpIcon: yr,
        AzureDevOpsIcon: wr,
        BackIcon: Cr,
        BasketIcon: Tr,
        BatchAcceptIcon: vr,
        BatchDenyIcon: Rr,
        BeakerIcon: Ar,
        BellIcon: kr,
        BitbucketIcon: Or,
        BoldIcon: xr,
        BookIcon: Lr,
        BookmarkHollowIcon: Pr,
        BookmarkIcon: Br,
        BottomBarIcon: Vr,
        BottomBarToggleIcon: Nr,
        BoxIcon: Ur,
        BranchIcon: Dr,
        BrowserIcon: ne,
        ButtonIcon: Mr,
        CPUIcon: Hr,
        CalendarIcon: Gr,
        CameraIcon: Fr,
        CameraStabilizeIcon: zr,
        CategoryIcon: Yr,
        CertificateIcon: qr,
        ChangedIcon: Wr,
        ChatIcon: jr,
        CheckIcon: Kr,
        ChevronDownIcon: Zr,
        ChevronLeftIcon: Xr,
        ChevronRightIcon: Jr,
        ChevronSmallDownIcon: $r,
        ChevronSmallLeftIcon: Qr,
        ChevronSmallRightIcon: ei,
        ChevronSmallUpIcon: ti,
        ChevronUpIcon: oi,
        ChromaticIcon: ni,
        ChromeIcon: ri,
        CircleHollowIcon: ii,
        CircleIcon: ci,
        ClearIcon: ai,
        CloseAltIcon: si,
        CloseIcon: li,
        CloudHollowIcon: Ii,
        CloudIcon: ui,
        CogIcon: pi,
        CollapseIcon: di,
        CommandIcon: mi,
        CommentAddIcon: hi,
        CommentIcon: fi,
        CommentsIcon: _i,
        CommitIcon: bi,
        CompassIcon: Ei,
        ComponentDrivenIcon: gi,
        ComponentIcon: Si,
        ContrastIcon: yi,
        ContrastIgnoredIcon: wi,
        ControlsIcon: Ci,
        CopyIcon: Ti,
        CreditIcon: vi,
        CrossIcon: Ri,
        DashboardIcon: Ai,
        DatabaseIcon: ki,
        DeleteIcon: Oi,
        DiamondIcon: xi,
        DirectionIcon: Li,
        DiscordIcon: Pi,
        DocChartIcon: Bi,
        DocListIcon: Vi,
        DocumentIcon: Ni,
        DownloadIcon: Ui,
        DragIcon: Di,
        EditIcon: Mi,
        EllipsisIcon: Hi,
        EmailIcon: Gi,
        ExpandAltIcon: Fi,
        ExpandIcon: zi,
        EyeCloseIcon: Yi,
        EyeIcon: qi,
        FaceHappyIcon: Wi,
        FaceNeutralIcon: ji,
        FaceSadIcon: Ki,
        FacebookIcon: Zi,
        FailedIcon: Xi,
        FastForwardIcon: Ji,
        FigmaIcon: $i,
        FilterIcon: Qi,
        FlagIcon: ec,
        FolderIcon: tc,
        FormIcon: oc,
        GDriveIcon: nc,
        GithubIcon: rc,
        GitlabIcon: ic,
        GlobeIcon: cc,
        GoogleIcon: ac,
        GraphBarIcon: sc,
        GraphLineIcon: lc,
        GraphqlIcon: Ic,
        GridAltIcon: uc,
        GridIcon: pc,
        GrowIcon: j,
        HeartHollowIcon: dc,
        HeartIcon: mc,
        HomeIcon: hc,
        HourglassIcon: fc,
        InfoIcon: _c,
        ItalicIcon: bc,
        JumpToIcon: Ec,
        KeyIcon: gc,
        LightningIcon: Sc,
        LightningOffIcon: yc,
        LinkBrokenIcon: wc,
        LinkIcon: Cc,
        LinkedinIcon: Tc,
        LinuxIcon: vc,
        ListOrderedIcon: Rc,
        ListUnorderedIcon: Ac,
        LocationIcon: kc,
        LockIcon: Oc,
        MarkdownIcon: xc,
        MarkupIcon: Lc,
        MediumIcon: Pc,
        MemoryIcon: Bc,
        MenuIcon: Vc,
        MergeIcon: Nc,
        MirrorIcon: Uc,
        MobileIcon: re,
        MoonIcon: Dc,
        NutIcon: Mc,
        OutboxIcon: Hc,
        OutlineIcon: Gc,
        PaintBrushIcon: Fc,
        PaperClipIcon: zc,
        ParagraphIcon: Yc,
        PassedIcon: qc,
        PhoneIcon: Wc,
        PhotoDragIcon: jc,
        PhotoIcon: Kc,
        PhotoStabilizeIcon: Zc,
        PinAltIcon: Xc,
        PinIcon: Jc,
        PlayAllHollowIcon: $c,
        PlayBackIcon: Qc,
        PlayHollowIcon: ea,
        PlayIcon: ta,
        PlayNextIcon: oa,
        PlusIcon: na,
        PointerDefaultIcon: ra,
        PointerHandIcon: ia,
        PowerIcon: ca,
        PrintIcon: aa,
        ProceedIcon: sa,
        ProfileIcon: la,
        PullRequestIcon: Ia,
        QuestionIcon: ua,
        RSSIcon: pa,
        RedirectIcon: da,
        ReduxIcon: ma,
        RefreshIcon: ie,
        ReplyIcon: ha,
        RepoIcon: fa,
        RequestChangeIcon: _a,
        RewindIcon: ba,
        RulerIcon: Ea,
        SaveIcon: ga,
        SearchIcon: Sa,
        ShareAltIcon: ya,
        ShareIcon: wa,
        ShieldIcon: Ca,
        SideBySideIcon: Ta,
        SidebarAltIcon: va,
        SidebarAltToggleIcon: Ra,
        SidebarIcon: Aa,
        SidebarToggleIcon: ka,
        SpeakerIcon: Oa,
        StackedIcon: xa,
        StarHollowIcon: La,
        StarIcon: Pa,
        StatusFailIcon: Ba,
        StatusIcon: Va,
        StatusPassIcon: Na,
        StatusWarnIcon: Ua,
        StickerIcon: Da,
        StopAltHollowIcon: Ma,
        StopAltIcon: Ha,
        StopIcon: Ga,
        StorybookIcon: Fa,
        StructureIcon: za,
        SubtractIcon: Ya,
        SunIcon: qa,
        SupportIcon: Wa,
        SweepIcon: ja,
        SwitchAltIcon: Ka,
        SyncIcon: Za,
        TabletIcon: ce,
        ThumbsUpIcon: Xa,
        TimeIcon: Ja,
        TimerIcon: $a,
        TransferIcon: K,
        TrashIcon: Qa,
        TwitterIcon: es,
        TypeIcon: ts,
        UbuntuIcon: os,
        UndoIcon: ns,
        UnfoldIcon: rs,
        UnlockIcon: is,
        UnpinIcon: cs,
        UploadIcon: as,
        UserAddIcon: ss,
        UserAltIcon: ls,
        UserIcon: Is,
        UsersIcon: us,
        VSCodeIcon: ps,
        VerifiedIcon: ds,
        VideoIcon: ms,
        WandIcon: hs,
        WatchIcon: fs,
        WindowsIcon: _s,
        WrenchIcon: bs,
        XIcon: Es,
        YoutubeIcon: gs,
        ZoomIcon: Ss,
        ZoomOutIcon: ys,
        ZoomResetIcon: ws,
        iconList: Cs,
      } = __STORYBOOK_ICONS__;
    var X = Se(se()),
      P = 'storybook/viewport',
      k = 'viewport',
      ue = {
        mobile1: {
          name: 'Small mobile',
          styles: { height: '568px', width: '320px' },
          type: 'mobile',
        },
        mobile2: {
          name: 'Large mobile',
          styles: { height: '896px', width: '414px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet',
          styles: { height: '1112px', width: '834px' },
          type: 'tablet',
        },
      },
      B = {
        name: 'Reset viewport',
        styles: { height: '100%', width: '100%' },
        type: 'desktop',
      },
      we = { [k]: { value: void 0, isRotated: !1 } },
      Ce = { viewport: 'reset', viewportRotated: !1 },
      Te = globalThis.FEATURES?.viewportStoryGlobals ? we : Ce,
      pe = (e, t) => e.indexOf(t),
      ve = (e, t) => {
        let c = pe(e, t);
        return c === e.length - 1 ? e[0] : e[c + 1];
      },
      Re = (e, t) => {
        let c = pe(e, t);
        return c < 1 ? e[e.length - 1] : e[c - 1];
      },
      de = async (e, t, c, l) => {
        (await e.setAddonShortcut(P, {
          label: 'Previous viewport',
          defaultShortcut: ['alt', 'shift', 'V'],
          actionName: 'previous',
          action: () => {
            c({ viewport: Re(l, t) });
          },
        }),
          await e.setAddonShortcut(P, {
            label: 'Next viewport',
            defaultShortcut: ['alt', 'V'],
            actionName: 'next',
            action: () => {
              c({ viewport: ve(l, t) });
            },
          }),
          await e.setAddonShortcut(P, {
            label: 'Reset viewport',
            defaultShortcut: ['alt', 'control', 'V'],
            actionName: 'reset',
            action: () => {
              c(Te);
            },
          }));
      },
      Ae = y.div({ display: 'inline-flex', alignItems: 'center' }),
      le = y.div(({ theme: e }) => ({
        display: 'inline-block',
        textDecoration: 'none',
        padding: 10,
        fontWeight: e.typography.weight.bold,
        fontSize: e.typography.size.s2 - 1,
        lineHeight: '1',
        height: 40,
        border: 'none',
        borderTop: '3px solid transparent',
        borderBottom: '3px solid transparent',
        background: 'transparent',
      })),
      ke = y(L)(() => ({ display: 'inline-flex', alignItems: 'center' })),
      Oe = y.div(({ theme: e }) => ({
        fontSize: e.typography.size.s2 - 1,
        marginLeft: 10,
      })),
      xe = {
        desktop: s.createElement(ne, null),
        mobile: s.createElement(re, null),
        tablet: s.createElement(ce, null),
        other: s.createElement(N, null),
      },
      Le = ({ api: e }) => {
        let t = z(k),
          [c, l, a] = F(),
          [E, p] = H(!1),
          { options: o = ue, disable: i } = t || {},
          m = c?.[k] || {},
          n = m.value,
          d = m.isRotated,
          r = o[n] || B,
          I = E || r !== B,
          u = k in a,
          h = Object.keys(o).length;
        if (
          (x(() => {
            de(e, n, l, Object.keys(o));
          }, [o, n, l, e]),
          r.styles === null || !o || h < 1)
        )
          return null;
        if (typeof r.styles == 'function')
          return (
            console.warn(
              'Addon Viewport no longer supports dynamic styles using a function, use css calc() instead'
            ),
            null
          );
        let g = d ? r.styles.height : r.styles.width,
          R = d ? r.styles.width : r.styles.height;
        return i
          ? null
          : s.createElement(Pe, {
              item: r,
              updateGlobals: l,
              viewportMap: o,
              viewportName: n,
              isRotated: d,
              setIsTooltipVisible: p,
              isLocked: u,
              isActive: I,
              width: g,
              height: R,
            });
      },
      Pe = s.memo(function (e) {
        let {
            item: t,
            viewportMap: c,
            viewportName: l,
            isRotated: a,
            updateGlobals: E,
            setIsTooltipVisible: p,
            isLocked: o,
            isActive: i,
            width: m,
            height: n,
          } = e,
          d = Q(r => E({ [k]: r }), [E]);
        return s.createElement(
          N,
          null,
          s.createElement(
            q,
            {
              placement: 'bottom',
              tooltip: ({ onHide: r }) =>
                s.createElement(Y, {
                  links: [
                    ...(length > 0 && t !== B
                      ? [
                          {
                            id: 'reset',
                            title: 'Reset viewport',
                            icon: s.createElement(ie, null),
                            onClick: () => {
                              (d({ value: void 0, isRotated: !1 }), r());
                            },
                          },
                        ]
                      : []),
                    ...Object.entries(c).map(([I, u]) => ({
                      id: I,
                      title: u.name,
                      icon: xe[u.type],
                      active: I === l,
                      onClick: () => {
                        (d({ value: I, isRotated: !1 }), r());
                      },
                    })),
                  ].flat(),
                }),
              closeOnOutsideClick: !0,
              onVisibleChange: p,
            },
            s.createElement(
              ke,
              {
                disabled: o,
                key: 'viewport',
                title: 'Change the size of the preview',
                active: i,
                onDoubleClick: () => {
                  d({ value: void 0, isRotated: !1 });
                },
              },
              s.createElement(j, null),
              t !== B
                ? s.createElement(Oe, null, t.name, ' ', a ? '(L)' : '(P)')
                : null
            )
          ),
          s.createElement(W, {
            styles: {
              'iframe[data-is-storybook="true"]': { width: m, height: n },
            },
          }),
          t !== B
            ? s.createElement(
                Ae,
                null,
                s.createElement(
                  le,
                  { title: 'Viewport width' },
                  m.replace('px', '')
                ),
                o
                  ? '/'
                  : s.createElement(
                      L,
                      {
                        key: 'viewport-rotate',
                        title: 'Rotate viewport',
                        onClick: () => {
                          d({ value: l, isRotated: !a });
                        },
                      },
                      s.createElement(K, null)
                    ),
                s.createElement(
                  le,
                  { title: 'Viewport height' },
                  n.replace('px', '')
                )
              )
            : null
        );
      }),
      Be = (0, X.default)(50)(e => [
        ...Ve,
        ...Object.entries(e).map(([t, { name: c, ...l }]) => ({
          ...l,
          id: t,
          title: c,
        })),
      ]),
      U = { id: 'reset', title: 'Reset viewport', styles: null, type: 'other' },
      Ve = [U],
      Ne = (0, X.default)(50)((e, t, c, l) =>
        e
          .filter(a => a.id !== U.id || t.id !== a.id)
          .map(a => ({
            ...a,
            onClick: () => {
              (c({ viewport: a.id }), l());
            },
          }))
      ),
      Ue = ({ width: e, height: t, ...c }) => ({ ...c, height: e, width: t }),
      De = y.div({ display: 'inline-flex', alignItems: 'center' }),
      Ie = y.div(({ theme: e }) => ({
        display: 'inline-block',
        textDecoration: 'none',
        padding: 10,
        fontWeight: e.typography.weight.bold,
        fontSize: e.typography.size.s2 - 1,
        lineHeight: '1',
        height: 40,
        border: 'none',
        borderTop: '3px solid transparent',
        borderBottom: '3px solid transparent',
        background: 'transparent',
      })),
      Me = y(L)(() => ({ display: 'inline-flex', alignItems: 'center' })),
      He = y.div(({ theme: e }) => ({
        fontSize: e.typography.size.s2 - 1,
        marginLeft: 10,
      })),
      Ge = (e, t, c) => {
        if (t === null) return;
        let l = typeof t == 'function' ? t(e) : t;
        return c ? Ue(l) : l;
      },
      Fe = $(function () {
        let [e, t] = F(),
          {
            viewports: c = ue,
            defaultOrientation: l,
            defaultViewport: a,
            disable: E,
          } = z(k, {}),
          p = Be(c),
          o = oe(),
          [i, m] = H(!1);
        (a &&
          !p.find(I => I.id === a) &&
          console.warn(
            `Cannot find "defaultViewport" of "${a}" in addon-viewport configs, please check the "viewports" setting in the configuration.`
          ),
          x(() => {
            de(o, e, t, Object.keys(c));
          }, [c, e, e.viewport, t, o]),
          x(() => {
            let I = l === 'landscape';
            ((a && e.viewport !== a) || (l && e.viewportRotated !== I)) &&
              t({ viewport: a, viewportRotated: I });
          }, [l, a, t]));
        let n =
            p.find(I => I.id === e.viewport) ||
            p.find(I => I.id === a) ||
            p.find(I => I.default) ||
            U,
          d = ee(),
          r = Ge(d.current, n.styles, e.viewportRotated);
        return (
          x(() => {
            d.current = r;
          }, [n]),
          E || Object.entries(c).length === 0
            ? null
            : s.createElement(
                N,
                null,
                s.createElement(
                  q,
                  {
                    placement: 'top',
                    tooltip: ({ onHide: I }) =>
                      s.createElement(Y, { links: Ne(p, n, t, I) }),
                    closeOnOutsideClick: !0,
                    onVisibleChange: m,
                  },
                  s.createElement(
                    Me,
                    {
                      key: 'viewport',
                      title: 'Change the size of the preview',
                      active: i || !!r,
                      onDoubleClick: () => {
                        t({ viewport: U.id });
                      },
                    },
                    s.createElement(j, null),
                    r
                      ? s.createElement(
                          He,
                          null,
                          e.viewportRotated
                            ? `${n.title} (L)`
                            : `${n.title} (P)`
                        )
                      : null
                  )
                ),
                r
                  ? s.createElement(
                      De,
                      null,
                      s.createElement(W, {
                        styles: {
                          'iframe[data-is-storybook="true"]': {
                            ...(r || { width: '100%', height: '100%' }),
                          },
                        },
                      }),
                      s.createElement(
                        Ie,
                        { title: 'Viewport width' },
                        r.width.replace('px', '')
                      ),
                      s.createElement(
                        L,
                        {
                          key: 'viewport-rotate',
                          title: 'Rotate viewport',
                          onClick: () => {
                            t({ viewportRotated: !e.viewportRotated });
                          },
                        },
                        s.createElement(K, null)
                      ),
                      s.createElement(
                        Ie,
                        { title: 'Viewport height' },
                        r.height.replace('px', '')
                      )
                    )
                  : null
              )
        );
      });
    G.register(P, e => {
      G.add(P, {
        title: 'viewport / media-queries',
        type: te.TOOL,
        match: ({ viewMode: t, tabId: c }) => t === 'story' && !c,
        render: () =>
          FEATURES?.viewportStoryGlobals ? M(Le, { api: e }) : M(Fe, null),
      });
    });
  })();
} catch (e) {
  console.error(
    '[Storybook] One of your manager-entries failed: ' + import.meta.url,
    e
  );
}
