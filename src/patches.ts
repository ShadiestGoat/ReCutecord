export default [
  {
    // &&p.getTextChatNotificationMode()===G.Ypu.ENABLED&&!N.Z.disableNotifications
    find: /\.getTextChatNotificationMode.+?\.disableNotifications/,
    replacements: [
      {
        match: /\.isBroadcastChannel\(\)\)return!1.+?disableNotifications\)/s,
        replace: `.isBroadcastChannel() || replugged.plugins.plugins.get("eu.shadygoat.cutecord").exports.shouldNotNotify(arguments[0]))`
      }
    ]
  }
]
