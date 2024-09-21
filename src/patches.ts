const PLUGIN = `replugged.plugins.plugins.get("eu.shadygoat.cutecord")`;

// See patches.md for explanation

export default [
  {
    // &&p.getTextChatNotificationMode()===G.Ypu.ENABLED&&!N.Z.disableNotifications
    find: /\.getTextChatNotificationMode.+?\.disableNotifications/,
    replacements: [
      // Initial notif logic
      {
        match: /let [a-zA-Z]+?=\(.+?CHANGELOG.+?return!1;/,
        replace: `if (!(${PLUGIN}.exports?.shouldNotify(arguments[0]) ?? false))return!1;`,
      },
      // Always enable sound - we know for sure that we're gonna show notifications :3
      {
        match: /;let ([A-Za-z]+?)=.?[a-zA-Z.]+\.isSoundDisabled\(.+?\)/,
        replace: ";let $1=true",
      },
      // Notification logic part 2
      {
        match: /;if\([a-zA-Z]+?&&.+?message3.+?!1;(?=let\{)/,
        replace: ";",
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
