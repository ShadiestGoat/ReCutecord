const PLUGIN = `replugged.plugins.plugins.get("eu.shadygoat.cutecord")`;

// See patches.md for explanation

export default [
  {
    // &&p.getTextChatNotificationMode()===G.Ypu.ENABLED&&!N.Z.disableNotifications
    find: /"NotificationStore"/,
    replacements: [
      // Initial notif logic
      // if(!T&&!S||d.type===J.uaV.CHANGELOG&&(null==d.changelog_id||E.Z.latestChangelogId()!==d.changelog_id))return!1;
      {
        match: /if(?!.*if.+?CHANGELOG)\(.+?CHANGELOG.+?return!1/,
        replace: `if (!(${PLUGIN}.exports?.shouldNotify(arguments[0]) ?? false))return!1;`,
      },
      // Always enable sound - we know for sure that we're gonna show notifications :3
      {
        match: /!(?!.*!.*isSoundDisabled).+?\.isSoundDisabled\(.*?\)/,
        replace: "true",
      },
      // Notification logic part 2 - always call notification noise
      // ;if(S&&(p&&q.Z.playNotificationSound("message3",.4,y),!ti)||!T)return!1;let D=n(808506).default,U=n(624864).Z,{OverlayNotificationDisabledSetting:R}=n(486016);if(null!=D.getFocusedPID()&&!U.isNotificationDisabled(R.TEXT_CHAT)&&!H.Z.disableNotifications)return!1
      {
        match:
          /;if(?<=canUseCustomNotificationSounds.*)\(.+?&&.+?\.playNotificationSound\(.+?\).+?disableNotifications.+?!1/,
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
