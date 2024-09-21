As of now, heres the current code (formatted, comments added):

```js
var t, i, l, s;
let { channelId: o, message: a, optimistic: d } = e;
if (d) return !1;

// get current settings
let _ = p.Z.getChannel(o),
  T = P.default.getUser(
    null === (t = a.author) || void 0 === t ? void 0 : t.id
  ),
  I = P.default.getCurrentUser();
if (null == _ || null == T) return !1;

// more config, we can get rid of this
let f = (0, w.eF)(a, o, !Q),
  g = M.Z.getNotifyMessagesInSelectedChannel() && (0, w.N_)(a, o);

// Notif logic, we should replace this w/ our own notif logic
if (
  (!f && !g) ||
  (a.type === W.uaV.CHANGELOG &&
    (null == a.changelog_id || E.Z.latestChangelogId() !== a.changelog_id))
)
  return !1;

// More config stuff - think customer sound pack
let A = !M.Z.isSoundDisabled(X), // except this - we should replace with 'true' (at this point we know we'll show a notif)
  O = H.ZP.canUseCustomNotificationSounds(I),
  h = C.Y.getCurrentConfig({ location: "NotificationStore" }).enabled,
  v =
    O && h && A
      ? null !==
          (s = (0, S.bb)(
            null !== (l = _.guild_id) && void 0 !== l ? l : W.aIL,
            o
          )) && void 0 !== s
        ? s
        : (0, S.iD)(_.guild_id)
      : void 0;

// Notif logic, we should get rid of this
if ((g && (A && Y.GN("message3", 0.4, void 0, v), !Q)) || !f) return !1;
let m = n(808506).Z,
  D = n(237997).Z;
if (
  null != m.getFocusedPID() &&
  D.getTextChatNotificationMode() === W.Ypu.ENABLED &&
  !G.Z.disableNotifications
)
  return !1;

// 'Show a notification' logic
let { icon: R, title: y, body: L } = (0, w.Xi)(_, a, T);
if (
  (u.Z.dispatch({
    type: "RPC_NOTIFICATION_CREATE",
    channelId: _.id,
    message: a,
    icon: R,
    title: y,
    body: L,
  }),
  (0, N.R)(a, _.guild_id),
  M.Z.getDesktopType() === W.qrD.NEVER)
)
  return A && Y.GN(X, J, void 0, v), !1;
let U = k.Z.showNotification(
  R,
  y,
  L,
  {
    notif_type: "MESSAGE_CREATE",
    notif_user_id: null === (i = a.author) || void 0 === i ? void 0 : i.id,
    message_id: a.id,
    message_type: a.type,
    channel_id: _.id,
    channel_type: _.type,
    guild_id: _.guild_id,
  },
  {
    omitViewTracking: !0,
    tag: a.id,
    sound: A ? X : void 0,
    soundpack: v,
    volume: J,
    onClick() {
      (0, Z.Kh)(_.id),
        (_.type === W.d4z.GUILD_VOICE ||
          _.type === W.d4z.GUILD_STAGE_VOICE) &&
          r.Z.updateChatOpen(_.id, !0),
        c.default.clickedNotification();
    },
  }
);
null != U && et.track(_.id, U);
```

