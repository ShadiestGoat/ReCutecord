const PLUGIN = `replugged.plugins.plugins.get("eu.shadygoat.cutecord")`;

export default [
  {
    // &&p.getTextChatNotificationMode()===G.Ypu.ENABLED&&!N.Z.disableNotifications
    find: /\.getTextChatNotificationMode.+?\.disableNotifications/,
    replacements: [
      {
        // Target doesn't support flags or smt idk
        // eslint-disable-next-line prefer-regex-literals
        match: RegExp("\\.isBroadcastChannel\\(\\)\\)return!1.+?return!1", "s"),
        replace: `.isBroadcastChannel() || !(${PLUGIN}.exports?.shouldNotify(arguments[0]) ?? false))return!1`,
      },
      {
        match: /void 0;.+?"message\d+?".+?\).+?return!1.+?disableNotifications\)return!1;/,
        replace: "void 0;",
      },
    ],
  },
  {
    find: /"IncomingCallStore"/,
    replacements: [
      ["getIncomingCalls", "\\.from\\((.+?)\\.values", "[]"],
      ["getIncomingCallChannelIds", ":(.+?)", "new Set()"],
      ["getFirstIncomingCallId", ":(.+?).values", "null"],
      ["hasIncomingCalls", "&&(.+?)\\.size", "false"],
    ].map(([func, reg, fallback]) => {
      return {
        match: RegExp(`${func}\\(\\)\\{.*?${reg}.*?\\}`, "s"),
        replace: `${func}(){const plug = ${PLUGIN}; return plug?.exports ? plug.exports.call.${func}($1) : ${fallback}}`,
      };
    }),
  },
];
