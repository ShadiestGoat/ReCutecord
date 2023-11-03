export default [
  {
    // &&p.getTextChatNotificationMode()===G.Ypu.ENABLED&&!N.Z.disableNotifications
    find: /\.getTextChatNotificationMode.+?\.disableNotifications/,
    replacements: [
      {
        match: /\.isBroadcastChannel\(\)\)return!1.+?disableNotifications\)/s,
        replace: `.isBroadcastChannel() || !replugged.plugins.plugins.get("eu.shadygoat.cutecord").exports.shouldNotify(arguments[0]))`,
      },
    ],
  },
  {
    find: /\.displayName="IncomingCallStore"/,
    replacements: [
      ["getIncomingCalls", "\\.from\\((.+?)\\.values", "[]"],
      ["getIncomingCallChannelIds", ":(.+?)", "new Set()"],
      ["getFirstIncomingCallId",":(.+?)\.values", "null"],
      ["hasIncomingCalls", "&&(.+?)\\.size", "0"]
    ].map(([func, reg, fallback]) => {
      return {
        match: RegExp(`${func}\\(\\)\\{.*?${reg}.*?\\}`, "s"),
        replace: `${func}(){const plug = replugged.plugins.plugins.get("eu.shadygoat.cutecord"); return plug?.exports ? plug.exports.call.${func}($1) : ${fallback}}`
      }
    })
  }
];
