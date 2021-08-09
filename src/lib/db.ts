import firebase from "src/lib/firebase";
// import { getStripe } from "./stripe";

interface DBUser {
  uid: string | null | undefined;
  name: string | null;
  email: string | null;
  provider: string | undefined;
  photoURL: string | null;
  // token: string | null;
}

export const createUser = (uid: string, user: DBUser) => {
  return firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .set(user, { merge: true });
};

// export const checkoutSessionRef = async (uid) => {
//   const docRef = await db
//     .collection("users")
//     .doc(uid)
//     .collection("checkout_sessions")
//     .add({
//       price: "price_1I6SBEJGNqgNu47cCWNBklHY",
//       success_url: window.location.origin,
//       cancel_url: window.location.origin,
//     });
//   docRef.onSnapshot(async (snap) => {
//     const { error, sessionId } = snap.data();
//     if (error) {
//       alert(`An error occured: ${error.message}`);
//     }
//     if (sessionId) {
//       const stripe = await getStripe();
//       stripe.redirectToCheckout({ sessionId });
//     }
//   });
// };

// export const goToBillingPortal = async () => {
//   const functionRef = firebase
//     .app()
//     .functions("asia-northeast1")
//     .httpsCallable("ext-firestore-stripe-subscriptions-createPortalLink");
//   const { data } = await functionRef({ returnUrl: window.location.origin });
//   window.location.assign(data.url);
// };
