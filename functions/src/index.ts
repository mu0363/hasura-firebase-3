import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setCustomClaim = functions.auth.user().onCreate(async (user) => {
  // 以下の Example JWT claimsを参照
  // https://hasura.io/docs/latest/graphql/core/auth/authentication/jwt.html
  const customClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "staff",
      "x-hasura-allowed-roles": ["staff"],
      "x-hasura-user-id": user.uid,
    },
  };

  try {
    // Admin SDK でのカスタム ユーザー クレームの設定と検証
    // https://firebase.google.com/docs/auth/admin/custom-claims?hl=ja
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    // カスタムクレームができるまでの時間が毎回ばらつきがあるため
    // カスタムクレームの作成が終わったタイミングを通知する仕組みが必要なので以下を追加
    await admin.firestore().collection("user_meta").doc(user.uid).create({
      refreshTime: admin.firestore.FieldValue.serverTimestamp(),
    });
    // React側でonSnapShotを使って "user_meta" に更新があったかどうかを検知する
  } catch (error) {
    console.error(error);
  }
});
