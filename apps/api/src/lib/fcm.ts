/**
 * Firebase Cloud Messaging (FCM) client via Firebase Admin SDK.
 * Used for web push notifications to PWA users.
 * TODO Layer 8: initialise firebase-admin once and cache the app instance.
 */

export const fcm = {
  /**
   * Send a push notification to a single FCM registration token.
   * TODO Layer 8: implement with firebase-admin messaging().send().
   */
  async sendToToken(params: {
    token: string
    title: string
    body: string
    data?: Record<string, string>
  }) {
    // TODO Layer 8:
    // const message = {
    //   notification: { title: params.title, body: params.body },
    //   data: params.data,
    //   token: params.token,
    // }
    // return admin.messaging().send(message)
    console.info('FCM sendToToken stub called', params)
  },

  /**
   * Send a push notification to a topic (e.g. all learners in a role).
   * TODO Layer 8: implement with firebase-admin messaging().sendToTopic().
   */
  async sendToTopic(params: { topic: string; title: string; body: string }) {
    console.info('FCM sendToTopic stub called', params)
  },
}
