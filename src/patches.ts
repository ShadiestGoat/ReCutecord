export default [
  {
    // &&p.getTextChatNotificationMode()===G.Ypu.ENABLED&&!N.Z.disableNotifications
    find: /\.getTextChatNotificationMode.+?\.disableNotifications/,
    replacements: [
      {
        match: /null!=d.getFocusedPID().+?disableNotifications/,
        replace: `replugged.plugins.plugins.get("eu.shadygoat.Cutecord").exports.shouldNotNotify(arguments[0])`
      }
    ]
  }
]
