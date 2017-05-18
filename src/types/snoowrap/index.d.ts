declare module 'snoowrap' {
  import EventEmitter from 'events';

  namespace Snoowrap {
    interface ConstructorOptions {
      userAgent: string;
      clientId?: string;
      clientSecret?: string;
      username?: string;
      password?: string;
      refreshToken?: string;
      accessToken?: string;
    }

    interface ConfigOptions {
      endpointDomain?: string;
      requestDelay?: number;
      requestTimeout?: number;
      continueAfterRatelimitError?: boolean;
      retryErrorCodes?: number[];
      maxRetryAttempts?: number;
      warnings?: boolean;
      debug?: boolean;
      proxies?: boolean;
    }

    interface AuthUrlOptions {
      clientId: string;
      scope: string[];
      redirectUri: string;
      permanent?: boolean; // defaults to true
      state?: string;
      endpointDomain?: string;
    }

    interface AuthCodeOptions {
      code: string;
      userAgent: string;
      clientId: string;
      clientSecret?: string;
      redirectUri: string;
      endpointDomain?: string;
    }
  }

  export type ConstructorOptions = Snoowrap.ConstructorOptions;

  export default class Snoowrap {
    static getAuthUrl(options: Snoowrap.AuthUrlOptions): string;
    static fromAuthCode(options: Snoowrap.AuthCodeOptions): Snoowrap;
    static noConflict(): typeof Snoowrap;
    constructor(options: Snoowrap.ConstructorOptions);
    config(opts: Snoowrap.ConfigOptions): Snoowrap.ConfigOptions;
    getUser(name: string): RedditUser;
    getComment(commentId: string): Comment;
    getSubreddit(displayName: string): Subreddit;
    getSubmission(submissionId: string): Submission;
    getMessage(messageId: string): PrivateMessage;
    getLivethread(threadId: string): LiveThread
    getMe(): RedditUser;
    getKarma(): Promise<any>; // undocumented type
    getPreferences(): Promise<any>; // undocumented type
    updatePreferences(updatedPreferences: any): Promise<void>;
    getMyTrophies(): Promise<any>; // undocumented type
    getFriends(): Promise<RedditUser[]>;
    getBlockedUsers(): Promise<RedditUser[]>;
    checkCaptchaRequirement(): Promise<boolean>;
    getNewCaptchaIdentifier(): Promise<string>;
    getCaptchaImage(identifier: string): Promise<string>;
    getSavedCategories(): Promise<any[]>; // undocumented type
    markAsVisited(links: Submission[]): Promise<void>;
    submitSelfpost(options: SubmitSelfPostOptions): Promise<Submission>;
    submitLink(options: SubmitLinkOptions): Promise<Submission>;
    getHot(subredditName?: string, options?: ListingOptions): Listing<Submission>;
    getNew(subredditName?: string, options?: ListingOptions): Listing<Submission>;
    getNewComments(subredditName?: string, options?: ListingOptions): Listing<Comment>;
    getRandomSubmission(subredditName?: string): Submission;
    getTop(subredditName?: string, options?: ListingOptions): Listing<Submission>;
    getControversial(subredditName?: string, options?: ListingOptions): Listing<Submission>;
    getRising(subredditName?: string, options?: ListingOptions): Listing<Submission>;
    getUnreadMessages(options?: ListingOptions): Listing<PrivateMessage>;
    getInbox(options?: { filter?: string }): Listing<PrivateMessage | Comment>;
    getModmail(options?: ListingOptions): Listing<PrivateMessage>;
    getSentMessages(options?: ListingOptions): Listing<PrivateMessage>;
    markMessagesAsRead(messages: PrivateMessage[] | string[]): Promise<void>;
    markMessagesAsUnread(messages: PrivateMessage[] | string[]): Promise<void>;
    readAllMessages(): Promise<void>;
    composeMessage(options: ComposeMessageParams): Promise<any>;
    getOauthScopeList(): Promise<{ [key: string]: { description: string; id: string; name: string } }>;
    search(options: SearchOptions): Listing<Submission>;
    searchSubredditNames(options: { query: string; exact?: boolean; includeNsfw?: boolean; }): Promise<string[]>;
    createSubreddit(options: Subreddit.Settings): Promise<Subreddit>;
    searchSubredditTopics(options: { filter: string; }): Promise<Subreddit[]>;
    getSubscriptions(options?: ListingOptions): Listing<Subreddit>;
    getContributorSubreddits(options?: ListingOptions): Listing<Subreddit>;
    getModeratedSubreddits(options?: ListingOptions): Listing<Subreddit>;
    searchSubreddits(options: { query: string } & ListingOptions): Listing<Subreddit>;
    getPopularSubreddit(options?: ListingOptions): Listing<Subreddit>;
    getNewSubreddits(options?: ListingOptions): Listing<Subreddit>;
    getGoldSubreddits(options?: ListingOptions): Listing<Subreddit>;
    getDefaultSubreddits(options?: ListingOptions): Listing<Subreddit>;
    checkUsernameAvailability(name: string): Promise<boolean>;
    createLivethread(options: LiveThread.Settings): Promise<LiveThread>;
    getStickiedLivethread(): Promise<LiveThread>; // throws 404 if no live thread is stickied
    getMyMultireddits(): Promise<MultiReddit[]>;
    createMultireddit(options: MultiReddit.Properties & { name: string; subreddits: Subreddit[] | string[]}): Promise<MultiReddit>;
    revokeRefreshToken(): Promise<void>;
    oauthRequest(options: any): Promise<any>; // options: https://www.npmjs.com/package/request
    credentialedClientRequest(options: any): Promise<any>; // options: https://www.npmjs.com/package/request
    unauthenticatedRequest(options: any): Promise<any>; // options: https://www.npmjs.com/package/request
    updateAccessToken(): Promise<string>;
    rawRequest(options: any): Promise<any>; // https://not-an-aardvark.github.io/snoowrap/snoowrap.html#rawRequest
  }

  interface ListingOptions {
    limit?: string;
    after?: string;
    before?: string;
    show?: string;
    count?: number;
  }

  namespace Listing {
    interface FetchMoreOptions {
      amount: number;
      skipReplies?: boolean;
      append?: boolean;
    }
  }

  interface Listing<T> extends Array<T> {
    isFinished: boolean;
    fetchMore(options: Listing.FetchMoreOptions): Listing<T>;
    fetchAll(options?: Listing.FetchMoreOptions): Listing<T>;
  }

  class RedditContent<T> {
    created: number;
    constructor(options: any, _r: Snoowrap, _hasFetched: boolean);

    fetch(): Promise<T>; // not sure - it's a wrapped promise
    refresh(): Promise<T>;
    toJSON(): T; // not sure about this
  }

  class ReplyableContent<T> extends RedditContent<T> {
    remove(options?: { spam?: boolean }): Promise<T>;
    approve(): Promise<T>;
    report(options?: { reason?: string }): Promise<T>;
    ignoreReports(): Promise<T>;
    unignoreReports(): Promise<T>;
    reply(text: string): Promise<ReplyableContent<T>>;
    blockAuthor(): Promise<T>;
  }

  class VoteableContent<T> extends ReplyableContent<T> {
    upvote(): Promise<T>;
    downvote(): Promise<T>;
    unvote(): Promise<T>
    save(): Promise<T>;
    unsave(): Promise<T>;
    distinguish(options?: { status?: boolean | string; sticky?: boolean; }): Promise<T>;
    undistinguish(): Promise<T>;
    edit(updatedText: string): Promise<T>;
    gild(): Promise<T>;
    enableInboxReplies(): Promise<T>;
    disableInboxReplies(): Promise<T>;
    expandReplies(options?: { limit?: number; depth?: number; }): Promise<T>;
    delete(): Promise<T>;
  }

  namespace Flair {
    // this is per-flair
    interface Params {
      text: string;
      cssClass?: string;
      textEditable?: boolean;
    }
    // this is for the entire subreddit
    interface Config {
      userFlairEnabled: boolean;
      userFlairPosition: 'left' | 'right';
      userFlairSelfAssignEnabled: boolean;
      linkFlairPosition: 'left' | 'right';
      linkFlairSelfAssignEnabled: boolean;
    }
    interface Template {
      flair_css_class: string;
      flair_template_id: string;
      flair_text_editable: string;
      flair_position: string;
      flair_text: string;
    }
    interface UserFlair {
      flair_css_class: string;
      user: string;
      flair_text: string;
    }
  }

  namespace Subreddit {
    interface UserDetails {
      date: number;
      name: string;
      id: string;
    }
    type BannedUser = UserDetails & { note: string; }
    type MutedUser = UserDetails;
    type Contributor = UserDetails;

    type SpamLevel = 'low' | 'high' | 'all';
    interface Settings {
      name: string;
      title: string;
      public_description: string;
      description: string;
      submit_text?: string;
      hide_ads?: boolean;
      lang?: string;
      type?: 'public' | 'private' | 'restricted' | 'gold_restricted' | 'gold_only' | 'archived' | 'employees_only';
      link_type?: 'any' | 'link' | 'self';
      submit_link_label?: string;
      submit_text_label?: string;
      wikimode?: 'modonly' | 'anyone' | 'disabled';
      wiki_edit_karma?: number;
      wiki_edit_age?: number;
      spam_links?: SpamLevel;
      spam_selfposts?: SpamLevel;
      spam_comments?: SpamLevel;
      over_18?: boolean;
      allow_top?: boolean;
      show_media?: boolean;
      exclude_banned_modqueue?: boolean;
      public_traffic?: boolean;
      collapse_deleted_comments?: boolean;
      suggested_comment_sort?: AvailableSorts; // TODO rename AvailableSorts?
      spoilers_enabled?: boolean;
    }

    interface ImageUploadOptions {
      file: string | ReadableStream;
      imageType?: string;
    }

    interface Rule {
      kind: string;
      short_name: string;
      description: string;
      violation_reason: string;
      created_utc: string;
      priority: number;
      description_html: string;
    }

    type ModeratorPermission = 'wiki' | 'posts' | 'access' | 'mail' | 'config' | 'flair';

    interface BanOptions {
      name: string;
      banMessage?: string;
      banReason?: string;
      duration?: number;
      banNote?: string;
    }
  }

  // https://github.com/not-an-aardvark/snoowrap/blob/master/src/objects/Subreddit.js
  class Subreddit extends RedditContent<Subreddit> {
    id: string;
    display_name: string;
    description: string;
    title: string;
    public_description: string;
    created_utc: number;
    subscribers: number;

    deleteAllUserFlairTemplates(): Promise<this>;
    deleteAllLinkFlairTemplates(): Promise<this>;
    deleteFlairTemplate(options: { flair_template_id: string; }): Promise<this>;
    createUserFlairTemplate(options: Flair.Params): Promise<this>;
    createLinkFlairTemplate(options: Flair.Params): Promise<this>;
    getLinkFlairTemplates(linkId: string): Promise<Flair.Template[]>;
    getUserFlairTemplates(): Promise<Flair.Template[]>;
    deleteUserFlair(name: string): Promise<this>;
    getUserFlair(name: string): Promise<Flair.Template>;
    setMultipleUserFlairs(flairs: Array<{
      name: string;
      text: string;
      cssClass: string;
    }>): Promise<this>;
    getUserFlairList(options?: ListingOptions & { name?: string; }): Listing<Flair.UserFlair>;
    configureFlair(options: Flair.Config): Promise<this>;
    getMyFlair(): Promise<Flair.Template>;
    selectMyFlair(options: { flair_template_id: string; text?: string; }): Promise<this>;
    showMyFlair(): Promise<this>;
    hideMyFlair(): Promise<this>;
    submitSelfPost(options: SubmitSelfPostOptions): Promise<Submission>;
    submitLink(options: SubmitLinkOptions): Promise<Submission>;
    getHot(options?: ListingOptions): Listing<Submission>;
    getNew(options?: ListingOptions): Listing<Submission>;
    getNewComments(options?: ListingOptions): Listing<Comment>;
    getRandomSubmission(): Promise<Submission>;
    getTop(options?: ListingOptions): Listing<Submission>; // TODO: additional 'time' opt here
    getControversial(options?: ListingOptions): Listing<Submission>; // TODO: additional 'time' opt here
    getRising(options?: ListingOptions): Listing<Submission>;
    getModmail(options?: ListingOptions): Listing<PrivateMessage>;
    getModerationLog(opts?: any): Listing<ModAction>; // TODO: options
    getReports(options?: ListingOptions): Listing<Submission | Comment>; // TODO opt 'only'
    getSpam(options?: ListingOptions): Listing<Submission | Comment>; // TODO opt 'only'
    getModqueue(options?: ListingOptions): Listing<Submission | Comment>; // TODO opt 'only'
    getUnmoderated(options?: ListingOptions): Listing<Submission | Comment>; // TODO 'only'
    getEdited(options?: ListingOptions): Listing<Submission | Comment>; // only
    acceptModeratorInvite(): Promise<this>;
    leaveModerator(): Promise<this>;
    leaveContributor(): Promise<this>;
    getStylesheet(): Promise<string>;
    search(options: BaseSearchOptions): Listing<Submission>;
    getBannedUsers(options?: ListingOptions): Listing<Subreddit.BannedUser>; // TODO: opt 'name'
    getMutedUsers(options?: ListingOptions): Listing<Subreddit.MutedUser>; // TODO opt 'name'
    getWikiBannedUsers(options?: ListingOptions): Listing<Subreddit.BannedUser>; // TODO: opt 'name'
    getContributors(options?: ListingOptions): Listing<Subreddit.Contributor>; // TODO: opt 'name'
    getWikiContributors(options?: ListingOptions): Listing<Subreddit.Contributor>; // 'name'
    getModerators(options?: ListingOptions): RedditUser[]; // 'name'
    deleteBanner(): Promise<this>;
    deleteHeader(): Promise<this>;
    deleteIcon(): Promise<this>;
    deleteImage(options: { imageName: string; }): Promise<this>;
    getSettings(): Promise<Subreddit.Settings>;
    editSettings(options: Subreddit.Settings): Promise<this>;
    getRecommendedSubreddits(options?: { omit?: string[]; }): Promise<Subreddit[]>;
    getSubmitText(): Promise<string>;
    updateStylesheet(options: { css: string; reason?: string; }): Promise<this>;
    subscribe(): Promise<this>;
    unsubscribe(): Promise<this>;
    uploadStylesheetImage(options: Subreddit.ImageUploadOptions & { name: string; }): Promise<this>;
    uploadHeaderImage(options: Subreddit.ImageUploadOptions): Promise<this>;
    uploadIcon(options: Subreddit.ImageUploadOptions): Promise<this>;
    uploadBannerImage(options: Subreddit.ImageUploadOptions): Promise<this>;
    getRules(): Promise<{ rules: Subreddit.Rule[]; site_rules: string[] }>;
    getSticky(options?: { num?: number }): Promise<Submission>;
    inviteModerator(options: { name: string; permissions?: Subreddit.ModeratorPermission[]; }): Promise<this>;
    revokeModeratorInvite(options: { name: string; }): Promise<this>;
    removeModerator(options: { name: string; }): Promise<this>;
    addContributor(options: { name: string; }): Promise<this>;
    removeContributor(options: { name: string; }): Promise<this>;
    banUser(options: Subreddit.BanOptions): Promise<this>;
    unbanUser(options: { name: string; }): Promise<this>;
    muteUser(options: { name: string; }): Promise<this>;
    unmuteUser(options: { name: string; }): Promise<this>;
    wikibanUser(options: { name: string; }): Promise<this>;
    unwikibanUser(options: { name: string; }): Promise<this>;
    addWikiContributor(options: { name: string; }): Promise<this>;
    removeWikiContributor(options: { name: string; }): Promise<this>;
    setModeratorPermissions(options: { name: string; permissions: Subreddit.ModeratorPermission; }): Promise<this>;
    getWikiPage(name: string): WikiPage;
    getWikiPages(): Promise<WikiPage[]>;
    getWikiRevisions(options?: ListingOptions): Listing<WikiPage.Revision>;
  }

  namespace WikiPage {
    interface Settings {
      listed: boolean;
      permissionLevel: 0 | 1 | 2;
    }

    interface EditOptions {
      text: string;
      reason?: string;
      perviousRevision?: string;
    }

    interface Revision {
      timestamp: number;
      reason: string;
      page: string;
      id: string;
      author: RedditUser;
    }
  }

  class WikiPage extends RedditContent<WikiPage> {
    content_md: string;
    getSettings(): Promise<WikiPage.Settings>;
    editSettings(options: WikiPage.Settings): Promise<this>;
    addEditor(options: { name: string; }): Promise<this>;
    removeEditor(options: { name: string; }): Promise<this>;
    edit(options: WikiPage.EditOptions): Promise<this>;
    getRevisions(options?: ListingOptions): Listing<WikiPage.Revision>;
    hideRevision(options: { id: string; }): Promise<this>;
    revert(options: { id: string; }): Promise<this>;
    getDiscussions(options?: ListingOptions): Listing<Submission>;
  }

  class PrivateMessage extends ReplyableContent<PrivateMessage> {
    id: string;
    name: string;
    subject: string;
    distinguished: string | null;
    subreddit: Subreddit;
    body: string;
    created: number;
    author: string;
    markAsRead(): Promise<this>;
    markAsUnread(): Promise<this>;
    muteAuthor(): Promise<this>;
    unmuteAuthor(): Promise<this>;
    deleteFromInbox(): Promise<this>;
  }

  interface ModAction extends RedditContent<ModAction> {
    target_body: string;
    mod_id36: string;
    created_utc: number;
    subreddit: Subreddit;
    target_title: string | null;
    target_permalink: string;
    subreddit_name_prefixed: string;
    details: string | null;
    action: string;
    target_author: string;
    target_fullname: string;
    sr_id36: string;
    id: string;
    mod: string;
    description: string | null;
  }

  class RedditUser extends RedditContent<RedditUser> {
    id: string;
    name: string;
    // TODO: lots more fields

    giveGold(months: string): Promise<any>;
    assignFlair(options: any): Promise<this>;
    friend(options: any): Promise<this>;
    unfriend(): Promise<any>;
    getFriendInformation(): Promise<any>;
    getTrophies(): Promise<any>;
    getOverview(options?: any): Listing<Comment | Submission>;
    getSubmissions(options?: any): Listing<Submission>;
    getComments(options?: any): Listing<Comment>;
    getUpvotedContent(options?: any): Listing<Comment | Submission>;
    getDownvotedContent(options?: any): Listing<Comment | Submission>;
    getHiddenContent(options?: any): Listing<Comment | Submission>;
    getSavedContent(options?: any): Listing<Comment | Submission>;
    getGildedContent(options?: any): Listing<Comment | Submission>;
    getMultireddit(name: string): MultiReddit;
    getMultireddits(): MultiReddit[];
  }

  class Comment extends VoteableContent<Comment> {
    subreddit: Subreddit;
  }

  type AvailableSorts = 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'random' | 'qa';

  class Submission extends VoteableContent<Submission> {
    subreddit: Subreddit;

    hide(): Promise<this>;
    unhide(): Promise<this>;
    lock(): Promise<this>;
    unlock(): Promise<this>;
    markNsfw(): Promise<this>;
    unmarkNsfw(): Promise<this>;
    markSpoiler(): Promise<this>;
    unmarkSpoiler(): Promise<this>;
    enableContestMode(): Promise<this>;
    disableContestMode(): Promise<this>;
    sticky(options?: { num?: number }): Promise<this>;
    unsticky(): Promise<this>;
    setSuggestedSort(sort: AvailableSorts): Promise<this>;
    markAsRead(): Promise<this>;
    getDuplicates(options?: ListingOptions): Listing<Submission>;
    getRelated(options?: ListingOptions): Submission; // deprecated
    getLinkFlairTemplates(): Object[]; // undocumented type
    assignFlair(options: { text: string; cssClass: string; }): Promise<this>;
    selectFlair(options: { flair_template_id: string; text?: string; }): Promise<this>;
  }

  namespace MultiReddit {
    interface Properties {
      name?: string;
      description?: string;
      visibility?: string;
      icon_name?: 'art and design' | 'ask' | 'books' | 'business' | 'cars' | 'comics' | 'cute animals' |
        'diy' | 'entertainment' | 'food and drink' | 'funny' | 'games' | 'grooming' | 'health' | 'life advice' |
        'military' | 'models pinup' | 'music' | 'news' | 'philosophy' | 'pictures and gifs' | 'science' | 'shopping' |
        'sports' | 'style' | 'tech' | 'travel' | 'unusual stories' | 'video';
      key_color?: string;
      weighting_scheme?: 'classic' | 'fresh';
    }
  }

  class MultiReddit extends RedditContent<MultiReddit> {
    copy(options: { newName: string; }): Promise<MultiReddit>;
    rename(options: { newName: string; }): Promise<this>;
    edit(options: MultiReddit.Properties): Promise<this>;
    addSubreddit(sub: Subreddit | string): Promise<this>;
    removeSubreddit(sub: Subreddit | string): Promise<this>;
    delete(): Promise<this>;
  }

  namespace LiveThread {
    type Permissions = 'update' | 'edit' | 'manage';
    type ReportReason = 'spam' | 'vote-manipulation' | 'personal-information' | 'sexualizing-minors' | 'site-breaking';

    interface Settings {
      title: string;
      description?: string;
      resources?: string;
      nsfw?: boolean;
    }
  }

  class LiveThread extends RedditContent<LiveThread> {
    stream: EventEmitter;
    addUpdate(body: string): Promise<this>;
    strikeUpdate(options: { id: string; }): Promise<this>;
    deleteUpdate(options: { id: string; }): Promise<this>;
    getContributors(): Promise<RedditUser[]>;
    inviteContributor(options: { name: string; permissions: LiveThread.Permissions[]}) : Promise<this>;
    revokeContributorInvite(options: { name: string; }): Promise<this>;
    acceptContributorInvite(): Promise<this>;
    leaveContributor(): Promise<this>;
    removeContributor(options: { name: string; }): Promise<this>;
    setContributorPermissions(options: {
      name: string;
      permissions: LiveThread.Permissions[];
    }): Promise<this>;
    editSettings(options: LiveThread.Settings): Promise<this>;
    closeThread(): Promise<this>;
    report(options: { reason: LiveThread.ReportReason; }): Promise<this>;
    getRecentUpdates(options? : ListingOptions): Listing<LiveUpdate>;
    getDiscussions(options?: ListingOptions): Listing<Submission>;
    closeStream(): void;
  }

  interface LiveUpdate {
    // ???
    [key: string]: any;
  }

  interface ComposeMessageParams {
    to: RedditUser | Subreddit | string;
    subject: string;
    text: string;
    fromSubreddit?: Subreddit | string;
    captchaIden?: string;
    captchaResponse?: string;
  }

  interface SubmitOptions {
    subredditName: string;
    title: string;
    sendReplies?: boolean;
    captchaIden?: string;
    captchaResponse?: string;
  }

  interface SubmitSelfPostOptions extends SubmitOptions {
    text?: string;
  }

  interface SubmitLinkOptions {
    url: string;
    resubmit?: boolean;
  }

  interface BaseSearchOptions {
    query: string;
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
    syntax?: 'cloudsearch' | 'lucene' | 'plain';
  }

  interface SearchOptions extends BaseSearchOptions {
    subreddit?: Subreddit | string;
    restrictSr?: boolean;
  }
}
