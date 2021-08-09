import {
  useEffect,
  useState,
  createContext,
  useContext,
  VFC,
  ReactNode,
} from "react";
import firebase from "src/lib/firebase";
import Cookie from "universal-cookie";
import { createUser } from "src/lib/db";

interface DBUser {
  uid: string | null | undefined;
  name: string | null;
  email: string | null;
  provider: string | undefined;
  photoURL: string | null;
  token: string | null;
}

interface ContextType {
  user: DBUser | null;
  signInWithGoogle: () => void;
  signOut: () => void;
}

interface Props {
  children: ReactNode;
}

const cookie = new Cookie();

const AuthContext = createContext<Partial<ContextType>>({});

const useProviderAuth = () => {
  const initialValue = {
    uid: null,
    name: null,
    email: null,
    provider: undefined,
    photoURL: null,
    token: null,
  };
  const [user, setUser] = useState<DBUser>(initialValue);

  const HASURA_TOKEN_KEY = "https://hasura.io/jwt/claims";

  const formatUser = async (user: firebase.User) => {
    const token = await user.getIdToken(true);
    return {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      provider: user.providerData[0]?.providerId,
      photoURL: user.photoURL,
      token: token,
      // stripeRole: (await getStripeRole()) || "free",
    };
  };

  const handleUser = async (rawUser: firebase.User | null) => {
    if (rawUser) {
      const user = await formatUser(rawUser);
      const { token, ...withOutToken } = user;
      console.log(token);

      createUser(user.uid, withOutToken);
      setUser(user);
      return user;
    } else {
      setUser(initialValue);
      return false;
    }
  };

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        handleUser(result.user);
      });
  };

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(initialValue);
        cookie.remove("token");
      });
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaims = idTokenResult.claims[HASURA_TOKEN_KEY];
        console.log(hasuraClaims);
        if (hasuraClaims) {
          handleUser(user);
          cookie.set("token", token, { path: "/" });
        } else {
          const userRef = firebase
            .firestore()
            .collection("user_meta")
            .doc(user.uid);
          userRef.onSnapshot(async () => {
            const tokenSnap = await user.getIdToken(true);
            const idTokenResult = await user.getIdTokenResult();
            const hasuraClaimsSnap = idTokenResult.claims[HASURA_TOKEN_KEY];
            console.log(hasuraClaimsSnap);
            if (hasuraClaimsSnap) {
              cookie.set("token", tokenSnap, { path: "/" });
            }
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, signInWithGoogle, signOut };
};

export const AuthProvider: VFC<Props> = ({ children }) => {
  const auth = useProviderAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
