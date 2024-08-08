export const SystemMessages = {
  SUCCESS: 'Operation successful',
  FAILURE: 'Operation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Invalid request parameters',

  USER_RETRIEVE_SUCCESS: 'User retrieval successful',
  USER_CREATE_SUCCESS: 'User created successfully',
  USER_UPDATE_SUCCESS: 'User updated successfully',
  USER_DELETE_SUCCESS: 'User deleted successfully',
  USER_EMAIL_EXISTS: 'User with email already exists',
  USER_NOT_FOUND: 'User not found',
  USER_UNAUTHORIZED: 'Unauthorized access to user resource',

  EVENT_CREATE_SUCCESS: 'Event created successfully',
  EVENT_UPDATE_SUCCESS: 'Event updated successfully',
  EVENT_DELETE_SUCCESS: 'Event deleted successfully',
  EVENT_RETRIEVE_SUCCESS: 'Event retrieval successful',
  EVENT_REGISTER_SUCCESS: 'Successfully registered for the event',
  EVENT_TICKET_SENT: 'Ticket sent to your email',
  EVENT_DUPLICATE_TITLE: 'Event with the same title already exists',
  EVENT_NOT_FOUND: 'Event not found',
  EVENT_PAST_EVENT: 'Cannot register for an event that has already passed',
  EVENT_ALREADY_REGISTERED: 'You are already registered for this event',
  EVENT_NOT_CREATOR: 'You are not the creator of this event',

  AUTH_LOGIN_SUCCESS: 'Login successful',
  AUTH_LOGOUT_SUCCESS: 'Logout successful',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_REGISTER_SUCCESS: 'Registration successful',
  AUTH_PASSWORD_MISMATCH: 'Passwords do not match',
  AUTH_TOKEN_MISSING: 'Authentication token is missing',
  AUTH_TOKEN_INVALID: 'Invalid or expired authentication token',

  TICKET_RETRIEVE_SUCCESS: 'Ticket retrieval successful',
  TICKET_SCAN_SUCCESS: 'Ticket scanned successfully',
  TICKET_CANCEL_SUCCESS: 'Ticket cancelled successfully',
  TICKET_INVALID: 'Ticket is no longer valid',
  TICKET_NOT_FOUND: 'Ticket not found',
  TICKET_ALREADY_EXISTS: 'Ticket already exists',
  TICKET_ALREADY_SCANNED: 'Ticket has already been scanned',
  TICKET_ALREADY_CANCELLED: 'Ticket has already been cancelled',

  NOTIFICATION_SENT_SUCCESS: 'Notification sent successfully',
  NOTIFICATION_RETRIEVE_SUCCESS: 'Notifications retrieved successfully',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
};
