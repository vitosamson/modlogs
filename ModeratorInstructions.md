# Moderator Instructions

As both a reddit user and a moderator of a moderately large subreddit, I believe there are two overarching reasons to publicize the actions that moderators take:

 1. From the user's perspective, the transparency provided by these logs will help build trust in the community.
 2. From the moderator's perspective, it will (hopefully) help cut down on the shill/nazi/etc accusations.

Mod Logs offers moderators flexibility in what they show in the logs, as well as some report functionality to sweeten the deal.

## How to

If you're a moderator of a subreddit that would like to opt-in to public moderation logs, follow these simple steps:

1. Add [/u/modlogs](https://www.reddit.com/user/modlogs) as a moderator of your subreddit. See the note on permissions below.
1. Create a `modlog_config` entry in your wiki. It should be accessible at /r/yourSub/wiki/modlog_config. If you make it viewable only by moderators, you'll need to give /u/modlogs the `wiki` mod permission. See the configuration section below.

That's it.

## Permissions

You can add [/u/modlogs](https://www.reddit.com/user/modlogs) as a moderator with no permissions, but if you want to use a custom configuration you'll need to give it the `wiki` permission.

## Configuration

If you want to customize the logs that are publicly available, you can create a wiki page on your subreddit. The page should be available at /r/yourSub/wiki/modlog_config.

The configuration is in YAML format, similar to AutoModerator config.

If you don't provide a custom configuration, the following default configuration will be used:

```yaml
# show a permalink to the moderated comment or submission
show_comment_links: false
show_submission_links: false

# show the contents of the moderated comment or submission
show_comment_contents: false
show_submission_contents: false

# show the author of the comment or submission
show_comment_author: false
show_submission_author: false

# show the submission title
show_submission_title: false

# show the name of the moderator who performed the action
show_moderator_name: false

# a comma-separated list of actions to include or exclude. include takes precedence.
# by default all actions are included, see below for available actions
include_actions: []
exclude_actions: []

# a comma-separated list of moderators to include or exclude. include takes precedence.
# by default all moderators in the subreddit are included
include_moderators: []
exclude_moderators: []
```

### Available actions

The following moderation actions can be used in the `include_actions` and `exclude_actions` configuration items:

  - banuser
  - unbanuser
  - removelink
  - approvelink
  - removecomment
  - approvecomment
  - addmoderator
  - invitemoderator
  - uninvitemoderator
  - acceptmoderatorinvite
  - removemoderator
  - addcontributor
  - removecontributor
  - editsettings
  - editflair
  - distinguish
  - marknsfw
  - wikibanned
  - wikicontributor
  - wikiunbanned
  - wikipagelisted
  - removewikicontributor
  - wikirevise
  - wikipermlevel
  - ignorereports
  - unignorereports
  - setpermissions
  - setsuggestedsort
  - sticky
  - unsticky
  - setcontestmode
  - unsetcontestmode
  - lock
  - unlock
  - muteuser
  - unmuteuser
  - createrule
  - editrule
  - deleterule
  - spoiler
  - unspoiler
  - modmail_enrollment

## Running reports

Reddit doesn't currently offer moderators any means to analyze user behavior in their subs. Mod Logs offers two types of reports.

In order to run a report, just send a modmail message from the desired subreddit to [/u/modlogs](https://www.reddit.com/message/compose/?to=modlogs&subject=report&message=type:) with "report" as the subject. In the body of the message, provide the options detailed in the report types below. Options must be provided in YAML format, like the modlog configuration earlier.

**Report requests must be sent via your subreddit's modmail, or the message will be ignored.**

### Top Offenders

This report type provides a list of users sorted by the total number of comment and submission removals they've had in the subreddit.

Moderators are excluded from this report.

Example message body:

```yaml
# this is required
type: top offenders

# optional, defaults to 5. the number of top offenders to include
limit: 10

# optional, defaults to 1 month
# example values: 1 day, 2 weeks, 3 months, 4 years, etc
period: 3 months
```

### Specific user

Use this report type to get a more detailed report on a specific user. It returns a list of removed content, the total number of removals, and the percentage of removals to contributions (contributions are limited to 3 months due to limits of the Reddit API, so this percentage may be inaccurate for periods of greater than 3 months).

Example message body:

```yaml
# this is required
type: user

# this is required
username: spez    # or /u/spez, either way is acceptable

# optional, defaults to 1 month
# example values: 1 day, 2 weeks, 3 months, etc
period: 2 weeks
```
