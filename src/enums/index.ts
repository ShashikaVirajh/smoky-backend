export enum EmailTypes {
  FORGOT_PASSWORD = 'forgot-password-email',
  RESET_PASSWORD = 'reset-password-email',
  CHANGE_PASSWORD = 'change-password',
  COMMENT = 'comments-email',
  FOLLOWER = 'followers-email',
  REACTION = 'reactions-email',
  DIRECT_MESSAGE = 'direct-message-email'
}

export enum AuthQueueJobs {
  ADD_AUTH_USER_TO_DB = 'add-auth-user-to-db'
}

export enum UserQueueJobs {
  ADD_USER_DETAILS_TO_DB = 'add-user-details-to-db'
}

export enum PostQueueJobs {
  ADD_POST_TO_DB = 'add-post-to-db',
  UPDATE_POST_IN_DB = 'update-post-in-db',
  DELETE_POST_FROM_DB = 'delete-post-from-db'
}

export enum ReactionQueueJobs {
  ADD_REACTION_TO_DB = 'add-reaction-to-db',
  REMOVE_REACTION_FROM_DB = 'remove-reaction-from-db'
}

export enum ModelNames {
  AUTH = 'Auth',
  USER = 'User',
  POST = 'Post',
  REACTION = 'Reaction'
}

export enum BaseRoutes {
  AUTH_ROUTE = '/api/v1/auth',
  POST_ROUTE = '/api/v1/post',
  REACTION_ROUTE = '/api/v1/reaction'
}
