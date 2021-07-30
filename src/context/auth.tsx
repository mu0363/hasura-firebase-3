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

interface ContextType {
  user: firebase.User | null;
  signInWithGoogle: () => void;
  signOut: () => void;
}

interface Props {
  children: ReactNode;
}

const cookie = new Cookie();

const AuthContext = createContext<Partial<ContextType>>({});

const useProviderAuth = () => {
  const [user, setUser] = useState<firebase.User | null>(null);

  const HASURA_TOKEN_KEY = "https://hasura.io/jwt/claims";

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        setUser(result.user);
      });
  };

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(null);
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
          setUser(user);
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
